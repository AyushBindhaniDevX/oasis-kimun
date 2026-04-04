'use client'

import { CheckCircle2 } from 'lucide-react'
import type { User } from 'firebase/auth'
import { CandidateForm } from '@/components/candidate-form'
import { DashboardHeader } from '@/components/dashboard/Header'
import { ReviewCard } from '@/components/dashboard/ReviewCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { STATUS_THEMES } from '@/lib/dashboard/themes'
import { Surface, SectionTitle } from '@/components/dashboard/ui/Surface'

function applicationProgress(app: Record<string, unknown> | null) {
  if (!app) return 0
  const keys = ['fullName', 'email', 'school', 'motivation', 'submittedAt', 'aiScore'] as const
  const filled = keys.filter((k) => app[k] !== undefined && app[k] !== null && app[k] !== '').length
  return Math.min(100, Math.round((filled / keys.length) * 100))
}

interface Props {
  user: User
  application: Record<string, unknown> | null
  editing: boolean
  setEditing: (v: boolean) => void
  onRefresh: () => Promise<void>
}

export function ApplicantPhaseView({
  user,
  application,
  editing,
  setEditing,
  onRefresh,
}: Props) {
  const status = String(application?.status ?? 'not_started').replace(/_/g, ' ')
  const statusKey = String(application?.status ?? '')
  const theme = STATUS_THEMES[statusKey] ?? 'bg-slate-100 text-slate-700 border-slate-200'
  const pct = applicationProgress(application)
  const interview = application?.interview as Record<string, unknown> | undefined
  const interviewScheduled = interview?.status === 'scheduled'
  const slotStart = interview?.slotStart as string | undefined

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 pb-16">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <DashboardHeader title="Application" subtitle="Recruitment — your status and details" />
        <p className="font-mono text-[10px] text-slate-500">
          ID · {(user.uid ?? '').slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Status"
          value={
            <Badge variant="outline" className={`border font-semibold capitalize ${theme}`}>
              {status}
            </Badge>
          }
        />
        <StatCard
          title="Score"
          value={application?.aiScore != null ? `${application.aiScore}%` : '—'}
        />
        <StatCard
          title="Submitted"
          value={
            application?.submittedAt
              ? new Date(String(application.submittedAt)).toLocaleDateString('en-GB')
              : 'Pending'
          }
        />
        <StatCard title="Cycle" value={<span className="text-lg font-semibold">Oasis</span>} />
      </div>

      {!application || editing ? (
        <Surface className="p-6 sm:p-8">
          <SectionTitle title="Your submission" />
          <CandidateForm
            initialValues={editing && application ? (application as any) : undefined}
            onSuccess={async () => {
              await onRefresh()
              setEditing(false)
            }}
          />
        </Surface>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Surface className="p-6 lg:col-span-2">
            <SectionTitle
              title="Details"
              action={
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              }
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Name" value={String(application.fullName ?? '—')} />
              <Field label="Email" value={String(application.email ?? '—')} />
              <Field label="Institution" value={String(application.school ?? '—')} />
              <Field
                label="Role"
                value={String(application.committee ?? application.ocRole ?? '—')}
                emphasize
              />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Motivation
              </p>
              <p className="mt-2 border-l-2 border-slate-200 pl-4 text-sm leading-relaxed text-slate-600">
                {String(application.motivation ?? '—')}
              </p>
            </div>
          </Surface>

          <ReviewCard percent={pct}>
            {interviewScheduled && slotStart && (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5">
                <div className="mb-3 flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Interview scheduled
                  </span>
                </div>
                <p className="text-[10px] font-semibold uppercase text-slate-400">Date & time</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {new Date(slotStart).toLocaleString()}
                </p>
              </div>
            )}
          </ReviewCard>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 text-sm ${emphasize ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
        {value}
      </p>
    </div>
  )
}
