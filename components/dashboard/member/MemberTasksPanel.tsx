'use client'

import { Clock, Plus } from 'lucide-react'
import type { User } from 'firebase/auth'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionTitle, Surface } from '@/components/dashboard/ui/Surface'
import { PRIORITY_THEMES, TASK_STATUS_THEMES } from '@/lib/dashboard/themes'

interface Props {
  user: User
  tasks: any[]
  onNewTask: () => void
  onOpenTask: (task: any) => void
}

export function MemberTasksPanel({ user, tasks, onNewTask, onOpenTask }: Props) {
  const mine = tasks.filter((t) => t.assignedTo?.includes(user.uid))
  const completed = mine.filter((t) => t.status === 'completed').length
  const overdue = mine.filter(
    (t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()
  ).length

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Tasks</h1>
          <p className="text-xs text-slate-400">Assigned to you</p>
        </div>
        <Button size="sm" onClick={onNewTask} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Surface className="p-3 text-center">
          <p className="text-xl font-semibold text-slate-900">{mine.length}</p>
          <p className="text-[10px] text-slate-400">Assigned</p>
        </Surface>
        <Surface className="p-3 text-center">
          <p className="text-xl font-semibold text-emerald-600">{completed}</p>
          <p className="text-[10px] text-slate-400">Done</p>
        </Surface>
        <Surface className="p-3 text-center">
          <p className="text-xl font-semibold text-rose-600">{overdue}</p>
          <p className="text-[10px] text-slate-400">Overdue</p>
        </Surface>
      </div>

      <Surface className="p-5">
        <SectionTitle title="List" />
        <div className="space-y-2">
          {mine.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No tasks yet.</p>
          ) : (
            mine.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onOpenTask(task)}
                className="flex w-full flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left transition hover:border-slate-200 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-slate-900">{task.title}</span>
                  <Badge className={`shrink-0 text-[10px] ${PRIORITY_THEMES[task.priority] ?? ''}`}>
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="line-clamp-2 text-xs text-slate-500">{task.description}</p>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span
                      className={
                        new Date(task.dueDate) < new Date() && task.status !== 'completed'
                          ? 'font-medium text-rose-600'
                          : ''
                      }
                    >
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  </span>
                  <Badge className={`text-[10px] ${TASK_STATUS_THEMES[task.status] ?? ''}`}>
                    {String(task.status).replace('_', ' ')}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </Surface>
    </div>
  )
}
