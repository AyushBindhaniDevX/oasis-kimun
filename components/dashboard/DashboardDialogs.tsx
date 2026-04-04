'use client'

import { Calendar, MapPin } from 'lucide-react'
import type { User } from 'firebase/auth'
import { format } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MEMBER_STATUS_THEMES, PRIORITY_THEMES, TASK_STATUS_THEMES } from '@/lib/dashboard/themes'

interface Props {
  user: User | null
  taskData: Record<string, unknown>
  setTaskData: (v: Record<string, unknown> | ((p: Record<string, unknown>) => Record<string, unknown>)) => void
  eventData: Record<string, unknown>
  setEventData: (v: Record<string, unknown> | ((p: Record<string, unknown>) => Record<string, unknown>)) => void
  inviteData: {
    email: string
    fullName: string
    role: string
    committee: string
    message: string
  }
  setInviteData: React.Dispatch<
    React.SetStateAction<{
      email: string
      fullName: string
      role: string
      committee: string
      message: string
    }>
  >
  showNewTask: boolean
  setShowNewTask: (v: boolean) => void
  showNewEvent: boolean
  setShowNewEvent: (v: boolean) => void
  showInvite: boolean
  setShowInvite: (v: boolean) => void
  showTaskDetails: boolean
  setShowTaskDetails: (v: boolean) => void
  showEventDetails: boolean
  setShowEventDetails: (v: boolean) => void
  showMemberProfile: boolean
  setShowMemberProfile: (v: boolean) => void
  selectedTask: any
  selectedEvent: any
  selectedMember: any
  createTask: () => Promise<boolean | void>
  createEvent: () => Promise<boolean | void>
  handleInviteMember: () => Promise<boolean | void>
  updateTaskStatus: (id: string, status: string) => void
  attendEvent: (id: string) => void
  resetTaskForm: () => void
  resetEventForm: () => void
}

export function DashboardDialogs({
  user,
  taskData,
  setTaskData,
  eventData,
  setEventData,
  inviteData,
  setInviteData,
  showNewTask,
  setShowNewTask,
  showNewEvent,
  setShowNewEvent,
  showInvite,
  setShowInvite,
  showTaskDetails,
  setShowTaskDetails,
  showEventDetails,
  setShowEventDetails,
  showMemberProfile,
  setShowMemberProfile,
  selectedTask,
  selectedEvent,
  selectedMember,
  createTask,
  createEvent,
  handleInviteMember,
  updateTaskStatus,
  attendEvent,
  resetTaskForm,
  resetEventForm,
}: Props) {
  return (
    <>
      <Dialog
        open={showNewTask}
        onOpenChange={(o) => {
          setShowNewTask(o)
          if (!o) resetTaskForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={String(taskData.title ?? '')}
              onChange={(e) => setTaskData((p) => ({ ...p, title: e.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={String(taskData.description ?? '')}
              onChange={(e) => setTaskData((p) => ({ ...p, description: e.target.value }))}
            />
            <Input
              type="date"
              value={String(taskData.dueDate ?? '').split('T')[0] || ''}
              onChange={(e) => setTaskData((p) => ({ ...p, dueDate: e.target.value }))}
            />
            <Select
              value={String(taskData.priority ?? 'medium')}
              onValueChange={(v) => setTaskData((p) => ({ ...p, priority: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowNewTask(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const ok = await createTask()
                if (ok) setShowNewTask(false)
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNewEvent}
        onOpenChange={(o) => {
          setShowNewEvent(o)
          if (!o) resetEventForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={String(eventData.title ?? '')}
              onChange={(e) => setEventData((p) => ({ ...p, title: e.target.value }))}
            />
            <Input
              type="datetime-local"
              value={String(eventData.startDate ?? '')}
              onChange={(e) => setEventData((p) => ({ ...p, startDate: e.target.value }))}
            />
            <Input
              type="datetime-local"
              value={String(eventData.endDate ?? '')}
              onChange={(e) => setEventData((p) => ({ ...p, endDate: e.target.value }))}
            />
            <Select
              value={String(eventData.type ?? 'meeting')}
              onValueChange={(v) => setEventData((p) => ({ ...p, type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Location"
              value={String(eventData.location ?? '')}
              onChange={(e) => setEventData((p) => ({ ...p, location: e.target.value }))}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowNewEvent(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const ok = await createEvent()
                if (ok) setShowNewEvent(false)
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={inviteData.email}
              onChange={(e) => setInviteData((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              placeholder="Full name"
              value={inviteData.fullName}
              onChange={(e) => setInviteData((p) => ({ ...p, fullName: e.target.value }))}
            />
            <Select
              value={inviteData.role}
              onValueChange={(v) => setInviteData((p) => ({ ...p, role: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="chair">Chair</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={inviteData.committee}
              onValueChange={(v) => setInviteData((p) => ({ ...p, committee: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Committee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General Assembly">General Assembly</SelectItem>
                <SelectItem value="Security Council">Security Council</SelectItem>
                <SelectItem value="Logistics">Logistics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const ok = await handleInviteMember()
                if (ok) setShowInvite(false)
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="sm:max-w-md">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">{selectedTask.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className={PRIORITY_THEMES[selectedTask.priority]}>{selectedTask.priority}</Badge>
                  <Badge className={TASK_STATUS_THEMES[selectedTask.status]}>{selectedTask.status}</Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Due {format(new Date(selectedTask.dueDate), 'MMM d, yyyy')}
                </p>
                {selectedTask.assignedTo?.includes(user?.uid) &&
                  selectedTask.status !== 'completed' && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        updateTaskStatus(selectedTask.id, 'completed')
                        setShowTaskDetails(false)
                      }}
                    >
                      Mark complete
                    </Button>
                  )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">{selectedEvent.description}</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                  {format(new Date(selectedEvent.startDate), 'MMM d, h:mm a')}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    {selectedEvent.location}
                  </div>
                )}
                {!selectedEvent.attendees?.includes(user?.uid) && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      attendEvent(selectedEvent.id)
                      setShowEventDetails(false)
                    }}
                  >
                    RSVP
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showMemberProfile} onOpenChange={setShowMemberProfile}>
        <DialogContent className="sm:max-w-md">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMember.fullName}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-slate-200 text-lg text-slate-800">
                    {String(selectedMember.fullName ?? '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm capitalize text-slate-600">
                    {String(selectedMember.role ?? '').replace('_', ' ')}
                  </p>
                  <Badge variant="outline" className={MEMBER_STATUS_THEMES[selectedMember.status]}>
                    {selectedMember.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-600">{selectedMember.email}</p>
              <p className="text-sm font-medium text-slate-900">Committee: {selectedMember.committee}</p>
              <p className="text-xs text-slate-400">
                Joined {format(new Date(selectedMember.joinedAt), 'MMM d, yyyy')}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
