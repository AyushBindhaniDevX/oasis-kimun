'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  title: string
  value: React.ReactNode
  subtitle?: string
  className?: string
}

export function StatCard({ title, value, subtitle, className = '' }: Props) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-6">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  )
}
