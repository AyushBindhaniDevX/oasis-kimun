'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS } from '@/lib/dashboard/themes'
import type { DashboardNavId } from '@/lib/dashboard/types'
import { BRAND } from '@/lib/media-assets'
import { cn } from '@/lib/utils'

interface Props {
  active: DashboardNavId
  onNavigate: (id: DashboardNavId) => void
  taskBadge: number
  teamBadge: number
  userName?: string | null
  photoUrl?: string | null
  onLogout: () => void
  onProfile: () => void
  children: React.ReactNode
}

export function GlassDashboardShell({
  active,
  onNavigate,
  taskBadge,
  teamBadge,
  userName,
  photoUrl,
  onLogout,
  onProfile,
  children,
}: Props) {
  const initial = userName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="relative min-h-svh overflow-hidden text-slate-100">
      <video
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[0.18]"
        src={BRAND.ambientVideo}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        aria-hidden
      />
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/92 to-slate-950" />

      <div className="relative z-10 flex min-h-svh">
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel flex w-64 shrink-0 flex-col border-r border-white/10 py-6"
        >
          <div className="flex items-center gap-3 px-5 pb-6">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-white/25">
              <Image
                src={BRAND.logoPng}
                alt="Oasis"
                fill
                className="object-cover"
                sizes="40px"
                unoptimized
                priority
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-white">Oasis</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-200/70">Workspace</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-3">
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon
              const isActive = active === item.id
              const badge =
                item.id === 'tasks' ? taskBadge : item.id === 'team' ? teamBadge : 0
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'relative z-0 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/15 text-white shadow-lg shadow-indigo-500/10'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={isActive ? 2.25 : 1.75} />
                  <span>{item.label}</span>
                  {badge > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500/25 to-violet-500/20" />
                  )}
                </motion.button>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 px-4 pt-4">
            <button
              type="button"
              onClick={onProfile}
              className="mb-3 flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/8"
            >
              <Avatar className="h-9 w-9 border border-white/20">
                <AvatarImage src={photoUrl ?? undefined} alt="" />
                <AvatarFallback className="bg-white/10 text-xs text-white">{initial}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{userName ?? 'Account'}</p>
                <p className="text-[10px] text-slate-400">Profile</p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-300 hover:bg-rose-500/15 hover:text-rose-200"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  )
}
