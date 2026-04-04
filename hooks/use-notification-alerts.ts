'use client'

import { ref, onValue } from 'firebase/database'
import { useEffect, useRef } from 'react'
import { getFirebaseDb } from '@/lib/firebase'
import { toast } from 'sonner'
import { playUiSound } from '@/lib/play-sound'

interface Notif {
  id: string
  title?: string
  message?: string
  type?: string
  read?: boolean
}

export function useNotificationAlerts(uid: string | undefined, enabled: boolean) {
  const seen = useRef<Set<string>>(new Set())
  const boot = useRef(true)

  useEffect(() => {
    if (!uid || !enabled) return
    const db = getFirebaseDb()
    const r = ref(db, `oc/notifications/${uid}`)
    const unsub = onValue(r, (snap) => {
      if (!snap.exists()) return
      const list: Notif[] = []
      snap.forEach((c) => {
        list.push({ id: c.key ?? '', ...c.val() })
      })
      if (boot.current) {
        list.forEach((n) => seen.current.add(n.id))
        boot.current = false
        return
      }
      for (const n of list) {
        if (!n.id || seen.current.has(n.id)) continue
        if (n.read) {
          seen.current.add(n.id)
          continue
        }
        seen.current.add(n.id)
        playUiSound('notify')
        toast.info(n.title ?? 'Notification', {
          description: n.message,
          duration: 8000,
        })
      }
    })
    return () => unsub()
  }, [uid, enabled])
}
