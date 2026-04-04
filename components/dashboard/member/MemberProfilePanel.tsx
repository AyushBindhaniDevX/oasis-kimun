'use client'

import { Bell, Calendar, LogOut, Target } from 'lucide-react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Surface } from '@/components/dashboard/ui/Surface'

export function MemberProfilePanel({ user, application, members, tasks, events, notifications, onLogout }: any) {
  const me = members.find((m: any) => m.uid === user.uid)
  const role = application?.ocRole ?? 'General Member'

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <Surface className="glass-panel p-8 text-center border-none ring-1 ring-white/10 rounded-[2.5rem]">
        <Avatar className="mx-auto h-24 w-24 border-4 border-primary/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <AvatarImage src={user.photoURL} />
          <AvatarFallback className="bg-primary text-2xl font-black text-white">{user.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-white">{user.displayName}</h1>
        <p className="text-sm font-medium text-white/30 lowercase mt-1">{user.email}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 ring-1 ring-primary/30">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">{role}</p>
        </div>
      </Surface>

      <div className="grid grid-cols-2 gap-4">
        <Surface className="glass-panel p-6 text-center border-none ring-1 ring-white/10 rounded-3xl">
          <p className="text-3xl font-black text-white">{tasks.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Assignments</p>
        </Surface>
        <Surface className="glass-panel p-6 text-center border-none ring-1 ring-white/10 rounded-3xl">
          <p className="text-3xl font-black text-white">{events.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Engagements</p>
        </Surface>
      </div>

      <Surface className="glass-panel p-6 border-none ring-1 ring-white/10 rounded-3xl space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary">Activity Stream</h3>
        <div className="space-y-3">
          {notifications.slice(0, 5).map((n: any) => (
            <div key={n.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 items-start">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bell className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{n.title}</p>
                <p className="text-xs text-white/30 font-medium">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </Surface>

      <Button variant="ghost" onClick={onLogout} className="w-full h-12 rounded-2xl text-rose-500 hover:bg-rose-500/10 font-black uppercase tracking-widest text-xs">
        <LogOut className="mr-3 h-4 w-4" /> Termination Session
      </Button>
    </div>
  )
}