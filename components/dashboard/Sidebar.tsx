'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import { 
  Home, Grid, Users, CalendarDays, 
  CheckSquare, MessageCircle, User, 
  ChevronRight, Globe 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SidebarNavItem {
  id: string
  label: string
  icon: LucideIcon
}

interface Props {
  items?: SidebarNavItem[]
  active?: string
  onSelect?: (id: string) => void
  badges?: Record<string, number>
}

const DEFAULT_ITEMS: SidebarNavItem[] = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'applications', label: 'Operations', icon: Grid },
  { id: 'team', label: 'Global Team', icon: Users },
  { id: 'calendar', label: 'Schedules', icon: CalendarDays },
  { id: 'tasks', label: 'Workflows', icon: CheckSquare },
  { id: 'chat', label: 'Messages', icon: MessageCircle },
  { id: 'profile', label: 'Settings', icon: User },
]

export function Sidebar({ 
  items, 
  active = 'home', 
  onSelect = () => {}, 
  badges = {} 
}: Props) {
  const list = items ?? DEFAULT_ITEMS

  return (
    <aside className="relative flex h-full w-full flex-col border-r border-white/[0.08] bg-[#09090b] md:w-64">
      {/* Kalinga International Branding */}
      <div className="relative z-10 flex items-center gap-3 px-6 py-9">
        {/* Logo with White BG */}
        <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-transform hover:scale-105">
          <Globe className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
          {/* Subtle Outer Glow Effect */}
          <div className="absolute inset-0 -z-10 rounded-xl bg-white/10 blur-md transition-opacity group-hover:opacity-100 opacity-0" />
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-bold tracking-tight text-white uppercase leading-none">
            Kalinga
          </span>
          <span className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-400/90">
            International
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {list.map((it) => {
          const Icon = it.icon
          const isActive = active === it.id
          const count = badges[it.id] ?? 0

          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
              )}
            >
              {/* Active Indicator (High-end Sliding Pill) */}
              {isActive && (
                <motion.div
                  layoutId="active-highlight"
                  className="absolute inset-0 rounded-xl bg-indigo-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-indigo-500/30"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}

              <div className="relative z-10 flex items-center gap-3 flex-1">
                <Icon 
                  className={cn(
                    "h-[18px] w-[18px] transition-all duration-300",
                    isActive ? "text-indigo-400 scale-110" : "text-zinc-500 group-hover:text-zinc-300"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                <span className="truncate font-semibold tracking-wide">{it.label}</span>
              </div>

              {/* Badges / Interactive Hints */}
              <div className="relative z-10 ml-auto">
                {count > 0 ? (
                  <motion.span 
                    initial={{ scale: 0.8 }} 
                    animate={{ scale: 1 }}
                    className="flex h-5 min-w-[20px] items-center justify-center rounded-lg bg-indigo-600 px-1.5 text-[10px] font-black text-white shadow-lg shadow-indigo-500/30"
                  >
                    {count > 99 ? '99+' : count}
                  </motion.span>
                ) : (
                  <ChevronRight className={cn(
                    "h-3.5 w-3.5 opacity-0 transition-all -translate-x-2",
                    !isActive && "group-hover:opacity-40 group-hover:translate-x-0"
                  )} />
                )}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Modern Footer Profile */}
      <div className="mt-auto p-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/50 p-2.5 ring-1 ring-white/5">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
             <div className="h-full w-full rounded-[7px] bg-zinc-950 flex items-center justify-center text-[10px] font-bold text-white">
                KI
             </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-[11px] font-bold text-zinc-200">System Admin</span>
            <span className="truncate text-[9px] text-zinc-500 uppercase tracking-tighter">Kalinga Instance 01</span>
          </div>
        </div>
      </div>
    </aside>
  )
}