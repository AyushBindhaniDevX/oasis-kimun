import { CalendarDays, CheckSquare, Home, MessageCircle, User, Users, type LucideIcon } from 'lucide-react'
import type { DashboardNavId } from './types'

export const STATUS_THEMES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  interview_phase: 'bg-violet-50 text-violet-700 border-violet-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  waitlisted: 'bg-slate-50 text-slate-600 border-slate-200',
}

export const MEMBER_STATUS_THEMES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-50 text-slate-400 border-slate-200',
  on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const PRIORITY_THEMES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600',
  urgent: 'bg-rose-100 text-rose-600',
  critical: 'bg-purple-100 text-purple-600',
}

export const TASK_STATUS_THEMES: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-600',
  review: 'bg-violet-100 text-violet-600',
  completed: 'bg-emerald-100 text-emerald-600',
  blocked: 'bg-rose-100 text-rose-600',
  cancelled: 'bg-slate-100 text-slate-400',
}

export const EVENT_COLORS: Record<string, string> = {
  meeting: 'bg-blue-100 text-blue-700 border-blue-200',
  deadline: 'bg-amber-100 text-amber-700 border-amber-200',
  training: 'bg-violet-100 text-violet-700 border-violet-200',
  social: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  workshop: 'bg-purple-100 text-purple-700 border-purple-200',
  conference: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  interview: 'bg-pink-100 text-pink-700 border-pink-200',
  review: 'bg-orange-100 text-orange-700 border-orange-200',
}

export const NAV_ITEMS: { id: DashboardNavId; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
]
