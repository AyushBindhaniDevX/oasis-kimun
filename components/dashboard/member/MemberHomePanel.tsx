'use client'

import { Calendar, CheckSquare, Clock, TrendingUp, Users, ArrowRight, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Surface } from '@/components/dashboard/ui/Surface'
import { cn } from '@/lib/utils'

export function MemberHomePanel({ user, application, statistics, tasks, events, onNavigate, onAttend }: any) {
  const firstName = (application?.fullName ?? user.displayName ?? 'Member').split(' ')[0]
  const myOpen = tasks.filter((t: any) => t.assignedTo?.includes(user.uid) && t.status !== 'completed')
  const upcoming = events.filter((e: any) => new Date(e.startDate) > new Date())

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Kalinga International</p>
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter text-white">Welcome, {firstName}.</h1>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-4 ring-primary/10 shadow-2xl">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">{firstName[0]}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Global Team" value={statistics.teamStats.activeMembers} icon={Users} />
        <MiniStat label="Tasks" value={statistics.taskStats.total} icon={CheckSquare} />
        <MiniStat label="Schedules" value={statistics.eventStats.upcoming} icon={Calendar} />
        <MiniStat label="Efficiency" value={`${Math.round(statistics.teamStats.taskCompletion)}%`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Surface className="glass-panel border-none p-0 overflow-hidden ring-1 ring-white/10 rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Critical Workflows</h3>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('tasks')} className="text-primary hover:bg-primary/10 font-bold">
                View All <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
            <div className="p-3 space-y-2">
              {myOpen.slice(0, 3).map((task: any) => (
                <div key={task.id} className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/5">
                  <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_10px]", task.priority === 'urgent' ? 'bg-rose-500' : 'bg-primary')} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-white">{task.title}</p>
                    <p className="text-[11px] font-bold uppercase text-white/20 tracking-tighter">Due {format(new Date(task.dueDate), 'MMM d')}</p>
                  </div>
                  <Badge className="bg-white/5 text-[9px] font-black border-none uppercase text-white/40">{task.status}</Badge>
                </div>
              ))}
            </div>
          </Surface>
        </div>
        <div className="lg:col-span-2">
          <Surface className="glass-panel border-none p-6 ring-1 ring-white/10 rounded-3xl h-full">
            <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-white/40">Timeline</h3>
            <div className="space-y-6">
              {upcoming.slice(0, 3).map((event: any) => (
                <div key={event.id} className="relative flex gap-4 pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-white/10">
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{event.title}</p>
                    <p className="text-[11px] font-medium text-white/30">{format(new Date(event.startDate), 'EEE, h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon: Icon }: any) {
  return (
    <Surface className="glass-panel group border-none p-6 ring-1 ring-white/10 transition-transform hover:-translate-y-1 rounded-3xl">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/20"><Icon className="h-5 w-5" /></div>
      </div>
      <div className="mt-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 leading-none">{label}</p>
        <p className="mt-2 text-3xl font-black tracking-tighter text-white">{value}</p>
      </div>
    </Surface>
  )
}