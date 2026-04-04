/*
Migration: convert chat/rooms/*/participants arrays -> maps ({ uid: true })

Usage:
  1. Place a Firebase service account JSON at ./serviceAccountKey.json OR set env var SERVICE_ACCOUNT_JSON with the JSON string.
  2. Set FIREBASE_DATABASE_URL to your RTDB URL (e.g. https://<project>.firebaseio.com).
  3. Run: `node ./scripts/migrate-participants.js`

This script is idempotent: it will only update rooms that have a participants node as an Array.
It logs what it changes and exits with non-zero on unrecoverable errors.
*/

const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')

function loadServiceAccount() {
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.SERVICE_ACCOUNT_JSON)
    } catch (e) {
      console.error('Failed to parse SERVICE_ACCOUNT_JSON')
      process.exit(1)
    }
  }

  const p = path.join(__dirname, '..', 'serviceAccountKey.json')
  if (fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  }

  console.error('No service account JSON found. Provide SERVICE_ACCOUNT_JSON or scripts/../serviceAccountKey.json')
  process.exit(1)
}

async function main() {
  const serviceAccount = loadServiceAccount()
  const databaseURL = process.env.FIREBASE_DATABASE_URL
  if (!databaseURL) {
    console.error('Set FIREBASE_DATABASE_URL env var to your Realtime Database URL')
    process.exit(1)
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  })

  const db = admin.database()
  const roomsRef = db.ref('chat/rooms')

  console.log('Reading chat/rooms...')
  const snapshot = await roomsRef.once('value')
  if (!snapshot.exists()) {
    console.log('No chat rooms found, nothing to migrate.')
    process.exit(0)
  }

  const updates = {}
  let changed = 0

  snapshot.forEach((child) => {
    const roomId = child.key
    const room = child.val()
    if (!room) return

    const participants = room.participants
    if (!participants) return

    // If participants is already an object map, skip
    if (typeof participants === 'object' && !Array.isArray(participants)) return

    // If it's an array, convert
    if (Array.isArray(participants)) {
      const map = {}
      participants.forEach((p) => {
        if (!p) return
        // accept both { uid: 'x' } or string ids
        if (typeof p === 'string') {
          map[p] = true
        } else if (p.uid) {
          map[p.uid] = true
        }
      })

      updates[`chat/rooms/${roomId}/participants`] = map
      changed += 1
      console.log(`Will update room ${roomId}: array -> map (${Object.keys(map).length} participants)`)
    }
  })

  if (changed === 0) {
    console.log('No rooms required migration.')
    process.exit(0)
  }

  console.log(`Applying ${changed} updates...`)
  try {
    await db.ref().update(updates)
    console.log('Migration complete.')
    process.exit(0)
  } catch (e) {
    console.error('Failed to apply updates:', e)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
