'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { ref, get } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'

export function useDashboardApplication(user: User | null) {
  const [application, setApplication] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchApplication = useCallback(async () => {
    if (!user) return
    try {
      const db = getDatabase()
      const appRef = ref(db, `applications/${user.uid}`)
      const snapshot = await get(appRef)
      if (snapshot.exists()) {
        setApplication(snapshot.val() as Record<string, unknown>)
      } else {
        setApplication(null)
      }
    } catch (e) {
      console.error('Error fetching application:', e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void fetchApplication()
  }, [user, fetchApplication])

  return { application, loading, fetchApplication, setApplication }
}
