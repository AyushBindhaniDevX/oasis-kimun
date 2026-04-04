'use client'

import { BRAND } from '@/lib/media-assets'

export function AmbientBackdrop() {
  return (
    <>
      <video
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[0.16]"
        src={BRAND.ambientVideo}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        aria-hidden
      />
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-950" />
    </>
  )
}
