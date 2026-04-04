'use client'

import { Search, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionTitle, Surface } from '@/components/dashboard/ui/Surface'
import { MEMBER_STATUS_THEMES } from '@/lib/dashboard/themes'

interface Props {
  members: any[]
  tasks: any[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  onInvite: () => void
  onSelectMember: (m: any) => void
}

export function MemberTeamPanel({
  members,
  tasks,
  searchQuery,
  setSearchQuery,
  onInvite,
  onSelectMember,
}: Props) {
  const active = members.filter((m) => m.status === 'active').length
  const filtered = members.filter(
    (m) =>
      searchQuery === '' ||
      String(m.fullName ?? '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Team</h1>
          <p className="text-xs text-slate-400">{active} active members</p>
        </div>
        <Button size="sm" onClick={onInvite} className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search"
          className="h-10 border-slate-200 pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Surface className="p-5">
        <SectionTitle title="Members" />
        <div className="space-y-2">
          {filtered.map((member) => (
            <button
              key={member.uid}
              type="button"
              onClick={() => onSelectMember(member)}
              className="flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left transition hover:border-slate-200 hover:bg-white"
            >
              <Avatar className="h-11 w-11 border border-slate-200">
                <AvatarFallback className="bg-slate-200 text-sm font-medium text-slate-700">
                  {String(member.fullName ?? '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{member.fullName}</p>
                    <p className="text-xs capitalize text-slate-400">
                      {String(member.role ?? '').replace('_', ' ')}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] ${MEMBER_STATUS_THEMES[member.status] ?? ''}`}
                  >
                    {member.status === 'on_leave' ? 'Leave' : member.status}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px] text-slate-600">
                    {member.committee}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {tasks.filter((t) => t.assignedTo?.includes(member.uid)).length} tasks
                  </span>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No matches.</p>
          )}
        </div>
      </Surface>
    </div>
  )
}
