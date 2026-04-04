'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Props {
  title?: string
  percent?: number
  children?: React.ReactNode
}

export function ReviewCard({ title = 'Review', percent = 0, children }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <Card>
      <CardContent className="p-6">
        <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-3 text-blue-400">{title}</h4>
        <Progress value={pct} className="h-2 mb-3" />
        <div className="text-[9px] font-bold text-slate-500 uppercase">{pct}% Complete</div>
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  )
}
