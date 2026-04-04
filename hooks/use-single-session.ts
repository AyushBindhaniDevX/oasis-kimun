'use client'

import { signOut } from 'firebase/auth'
import { ref, set, onValue, serverTimestamp } from 'firebase/database'
import { useEffect, useRef } from 'react'
import { auth, getFirebaseDb } from '@/lib/firebase'
import { toast } from 'sonner'

const STORAGE_KEY = 'oasis_session_id'

export function useSingleSession(uid: string | undefined, enabled: boolean) {
  const started = useRef(false)

  useEffect(() => {
    if (!uid || !enabled) return
    if (started.current) return
    started.current = true

    const db = getFirebaseDb()
    const sessionRef = ref(db, `activeSessions/${uid}`)

    let sid = sessionStorage.getItem(STORAGE_KEY)
    if (!sid) {
      sid = crypto.randomUUID()
      sessionStorage.setItem(STORAGE_KEY, sid)
    }

    void set(sessionRef, {
      sessionId: sid,
      updatedAt: serverTimestamp(),
    })

    const unsub = onValue(sessionRef, (snap) => {
      const v = snap.val() as { sessionId?: string } | null
      const remote = v?.sessionId
      const local = sessionStorage.getItem(STORAGE_KEY)
      if (remote && local && remote !== local) {
        toast.error('Signed out — this account is active on another device.')
        sessionStorage.removeItem(STORAGE_KEY)
        void signOut(auth)
      }
    })

    return () => {
      unsub()
      started.current = false
    }
  }, [uid, enabled])
}
