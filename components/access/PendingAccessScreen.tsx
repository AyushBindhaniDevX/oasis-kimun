'use client'

import { motion } from 'framer-motion'
import { LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/lib/media-assets'

interface Props {
  onLogout: () => void
}

export function PendingAccessScreen({ onLogout }: Props) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <video
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-20"
        src={BRAND.ambientVideo}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        aria-hidden
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/90 via-indigo-950/85 to-slate-950/95" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel relative z-10 w-full max-w-md rounded-3xl border border-white/15 p-8 text-center shadow-2xl shadow-indigo-500/10"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20"
        >
          <img src={BRAND.logoPng} alt="" width={48} height={48} className="rounded-lg" fetchPriority="high" />
        </motion.div>
        <div className="mb-2 flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-indigo-200/90">
          <Shield className="h-4 w-4" />
          Awaiting approval
        </div>
        <h1 className="text-xl font-semibold text-white">Access pending</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300/90">
          An administrator must activate your account before you can use the workspace. You will keep a single active
          session once approved.
        </p>
        <Button
          variant="outline"
          className="mt-8 w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </motion.div>
    </div>
  )
}
