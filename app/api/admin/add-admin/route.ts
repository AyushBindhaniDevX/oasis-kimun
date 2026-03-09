import admin from 'firebase-admin'

// Initialize Firebase Admin SDK (if not already initialized).
// Prefer an explicit service account via `FIREBASE_SERVICE_ACCOUNT` (stringified JSON)
// or a file path via `GOOGLE_APPLICATION_CREDENTIALS`.
// Do NOT fall back to the metadata server in local development (it causes noisy ENOTFOUND logs).
function initAdmin(): boolean {
  if (admin.apps.length) return true

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
      admin.initializeApp({
        credential: admin.credential.cert(svc),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
      return true
    } catch (e) {
      console.warn('Invalid FIREBASE_SERVICE_ACCOUNT JSON; not initializing Admin SDK.', e)
      return false
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
      return true
    } catch (e) {
      console.warn('Failed to initialize Admin SDK with applicationDefault()', e)
      return false
    }
  }

  console.warn('Firebase Admin SDK not initialized: set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS to enable admin operations.')
  return false
}

// This endpoint should only be callable by existing admins. We accept an ID token
// in the `Authorization: Bearer <idToken>` header and verify it via the Admin SDK.
export async function POST(req: Request) {
  try {
    const initialized = initAdmin()
    if (!initialized) {
      return Response.json({ error: 'Server missing Firebase admin credentials. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.' }, { status: 500 })
    }

    const { userUid, email } = await req.json()
    if (!userUid) {
      return Response.json({ error: 'User UID is required' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    let requesterUid: string | null = null
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      try {
        const decoded = await admin.auth().verifyIdToken(token)
        requesterUid = (decoded as any).uid
      } catch (e) {
        console.warn('Invalid ID token', e)
      }
    }

    const db = admin.database()
    const adminsRef = db.ref('admins')
    const adminsSnapshot = await adminsRef.once('value')
    const adminsVal = adminsSnapshot.exists() ? adminsSnapshot.val() : null
    const hasAdmins = adminsSnapshot.exists() && Object.keys(adminsVal || {}).length > 0

    if (hasAdmins) {
      // Must be authenticated and an existing admin to add new admins
      if (!requesterUid) {
        return Response.json({ error: 'Unauthorized: missing ID token' }, { status: 401 })
      }
      const requesterIsAdmin = await db.ref(`admins/${requesterUid}`).once('value')
      if (!requesterIsAdmin.exists()) {
        return Response.json({ error: 'Forbidden: only admins can add admins' }, { status: 403 })
      }
    } else {
      // No admins exist yet: allow bootstrap only if the caller is adding themselves
      // or a valid server secret is provided in `x-admin-secret`.
      const secret = process.env.ADD_ADMIN_SECRET
      const provided = req.headers.get('x-admin-secret')
      if (secret && provided && provided === secret) {
        // allowed via secret
      } else if (requesterUid && requesterUid === userUid) {
        // allowed: creating initial admin for self
      } else {
        return Response.json({ error: 'Forbidden: cannot create initial admin without authentication or secret' }, { status: 403 })
      }
    }

    // Set admin record using Admin SDK (bypasses Realtime DB rules)
    const adminRef = db.ref(`admins/${userUid}`)
    await adminRef.set({
      role: 'admin',
      email: email || '',
      addedAt: new Date().toISOString(),
      status: 'active',
    })

    return Response.json({ success: true, message: `Admin user ${email} has been added successfully`, uid: userUid })
  } catch (error) {
    console.error('Error adding admin:', error)
    return Response.json({ error: `Failed to add admin: ${String(error)}` }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const initialized = initAdmin()
    if (!initialized) {
      return Response.json({ error: 'Server missing Firebase admin credentials. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const uid = searchParams.get('uid')

    if (!uid) {
      return Response.json({ error: 'UID query parameter is required' }, { status: 400 })
    }

    const db = admin.database()
    const adminRef = db.ref(`admins/${uid}`)
    const snapshot = await adminRef.once('value')

    if (snapshot.exists()) {
      return Response.json({ exists: true, data: snapshot.val() })
    } else {
      return Response.json({ exists: false, message: 'User is not an admin' })
    }
  } catch (error) {
    console.error('Error checking admin status:', error)
    return Response.json({ error: `Failed to check admin status: ${String(error)}` }, { status: 500 })
  }
}
