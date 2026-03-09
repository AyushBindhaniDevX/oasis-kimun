"use client"

import React, { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { getFirebaseDb } from '@/lib/firebase'
import { ref, set } from 'firebase/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function AddAdminPage() {
  const { user, loading } = useAuth()
  const [uid, setUid] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const addAdmin = async (payload: { userUid: string; email?: string }) => {
    setSubmitting(true)
    try {
      // Write directly from client to Realtime Database for self-add (no service account required)
      const db = getFirebaseDb()
      const adminRef = ref(db, `admins/${payload.userUid}`)
      await set(adminRef, {
        role: 'admin',
        email: payload.email || '',
        addedAt: new Date().toISOString(),
        status: 'active',
      })

      toast.success('Admin added')
      // Reload so auth context re-checks admin status
      setTimeout(() => window.location.reload(), 700)
    } catch (err: any) {
      console.error('Add admin error:', err)
      toast.error(err?.message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddMe = () => {
    if (!user) return toast.error('Please sign in first')
    addAdmin({ userUid: user.uid, email: user.email || '' })
  }

  const handleAddOther = () => {
    if (!uid) return toast.error('UID is required')
    addAdmin({ userUid: uid, email })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Add Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Quickly add yourself as admin (must be signed in).</p>
              <Button onClick={handleAddMe} disabled={loading || submitting} className="mt-3">
                {submitting ? 'Adding...' : 'Add me as admin'}
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Or add another user by UID / email</p>
              <Input placeholder="User UID" value={uid} onChange={(e) => setUid(e.target.value)} className="mt-2" />
              <Input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
              <Button onClick={handleAddOther} disabled={submitting} className="mt-3">
                {submitting ? 'Adding...' : 'Add user'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-2">
              <p>Note: the API endpoint is currently unprotected. Secure it before using in production.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
