'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  title?: string
  subtitle?: string
  onPrimary?: () => void
  primaryLabel?: string
}

export function DashboardHeader({
  title = 'Dashboard',
  subtitle,
  onPrimary,
  primaryLabel = 'New',
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-light tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {onPrimary && (
        <div>
          <Button onClick={onPrimary}>{primaryLabel}</Button>
        </div>
      )}
    </div>
  )
}
