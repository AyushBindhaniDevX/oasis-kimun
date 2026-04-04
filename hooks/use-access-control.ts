'use client'

import { ref, get, set } from 'firebase/database'
import { useCallback, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { getFirebaseDb } from '@/lib/firebase'

export type AccessState = 'loading' | 'approved' | 'pending'

interface AccessControlRow {
  approved?: boolean
  email?: string
  displayName?: string
  requestedAt?: string
  source?: string
}

/**
 * Candidates need admin approval unless they already have an application record
 * (grandfathered) or are explicitly approved in accessControl.
 */
export function useAccessControl(user: User | null, isAdmin: boolean) {
  const [state, setState] = useState<AccessState>('loading')

  const refresh = useCallback(async () => {
    if (!user) {
      setState('approved')
      return
    }
    if (isAdmin) {
      setState('approved')
      return
    }

    const db = getFirebaseDb()
    const uid = user.uid
    const acRef = ref(db, `accessControl/${uid}`)
    const appRef = ref(db, `applications/${uid}`)

    try {
      const results = await Promise.allSettled([get(acRef), get(appRef)])
      const acRes = results[0]
      const appRes = results[1]

      if (acRes.status === 'fulfilled') {
        const acSnap = acRes.value
        if (acSnap.exists()) {
          const row = acSnap.val() as AccessControlRow
          setState(row.approved === true ? 'approved' : 'pending')
          return
        }
      } else {
        console.warn('accessControl:get(acRef) failed:', acRes.reason)
      }

      if (appRes.status === 'fulfilled') {
        const appSnap = appRes.value
        if (appSnap.exists()) {
          const row: AccessControlRow = {
            approved: true,
            source: 'legacy_application',
            email: user.email ?? undefined,
            displayName: user.displayName ?? undefined,
            requestedAt: new Date().toISOString(),
          }
          try {
            await set(acRef, row)
          } catch (e) {
            console.warn('accessControl:set(acRef) failed:', e)
          }
          setState('approved')
          return
        }
      } else {
        console.warn('accessControl:get(appRef) failed:', appRes.reason)
      }

      // fallback: create a pending request if reads succeeded previously, else set pending
      try {
        const pending: AccessControlRow = {
          approved: false,
          email: user.email ?? undefined,
          displayName: user.displayName ?? undefined,
          requestedAt: new Date().toISOString(),
        }
        await set(acRef, pending)
        setState('pending')
      } catch (e) {
        console.error('accessControl fallback failed:', e)
        // If we cannot write due to permission, allow access to avoid blocking UX
        setState('approved')
      }
    } catch (e) {
      console.error('accessControl unexpected error:', e)
      setState('approved')
    }
  }, [user, isAdmin])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { accessState: state, refreshAccess: refresh }
}
