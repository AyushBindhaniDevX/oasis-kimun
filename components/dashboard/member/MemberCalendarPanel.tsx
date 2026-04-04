'use client'

import { AlertCircle, ChevronLeft, ChevronRight, Clock, Plus, Users } from 'lucide-react'
import { addDays, eachDayOfInterval, endOfWeek, format, isToday, startOfWeek, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { SectionTitle, Surface } from '@/components/dashboard/ui/Surface'
import { EVENT_COLORS } from '@/lib/dashboard/themes'

interface Props {
  events: any[]
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  calendarView: 'month' | 'week' | 'day'
  setCalendarView: (v: 'month' | 'week' | 'day') => void
  onNewEvent: () => void
  onOpenEvent: (e: any) => void
}

export function MemberCalendarPanel({
  events,
  selectedDate,
  setSelectedDate,
  calendarView,
  setCalendarView,
  onNewEvent,
  onOpenEvent,
}: Props) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  })
  const upcoming = events.filter((e) => new Date(e.startDate) > new Date())

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(subDays(selectedDate, 7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="min-w-[8rem] text-center text-lg font-semibold text-slate-900">
            {format(selectedDate, 'MMMM yyyy')}
          </h1>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {(['week', 'month'] as const).map((view) => (
            <Button
              key={view}
              variant={calendarView === view ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => setCalendarView(view)}
            >
              {view}
            </Button>
          ))}
          <Button size="sm" className="h-8 gap-1 text-xs" onClick={onNewEvent}>
            <Plus className="h-3.5 w-3.5" />
            Event
          </Button>
        </div>
      </div>

      <Surface className="overflow-hidden p-3">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((date) => (
            <div key={date.toISOString()} className="text-center text-[10px] font-medium text-slate-400">
              {format(date, 'EEE')}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date) => {
            const dayKey = format(date, 'yyyy-MM-dd')
            const dayEvents = events.filter((e) => format(new Date(e.startDate), 'yyyy-MM-dd') === dayKey)
            const today = isToday(date)
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[88px] rounded-xl border p-1.5 ${
                  today ? 'border-slate-900 ring-1 ring-slate-900/10' : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                <span className={`text-[11px] font-medium ${today ? 'text-slate-900' : 'text-slate-500'}`}>
                  {format(date, 'd')}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onOpenEvent(event)}
                      className={`block w-full truncate rounded px-1 py-0.5 text-left text-[9px] font-medium ${EVENT_COLORS[event.type] ?? 'bg-slate-100'}`}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[8px] text-slate-400">+{dayEvents.length - 3}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Surface>

      <Surface className="p-5">
        <SectionTitle title="Upcoming" />
        <div className="space-y-2">
          {upcoming.slice(0, 8).map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onOpenEvent(event)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-left transition hover:bg-white"
            >
              <div className={`rounded-lg border p-2 ${EVENT_COLORS[event.type] ?? ''}`}>
                {event.type === 'meeting' ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{event.title}</p>
                <p className="text-xs text-slate-400">
                  {format(new Date(event.startDate), 'MMM d, h:mm a')}
                </p>
              </div>
              {event.mandatory && <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />}
            </button>
          ))}
          {upcoming.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">No upcoming events.</p>
          )}
        </div>
      </Surface>
    </div>
  )
}
