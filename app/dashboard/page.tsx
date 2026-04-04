'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PendingAccessScreen } from '@/components/access/PendingAccessScreen'
import { ApplicantPhaseView } from '@/components/dashboard/applicant/ApplicantPhaseView'
import { DashboardDialogs } from '@/components/dashboard/DashboardDialogs'
import { MemberCalendarPanel } from '@/components/dashboard/member/MemberCalendarPanel'
import { MemberChatPanel } from '@/components/dashboard/member/MemberChatPanel'
import { MemberHomePanel } from '@/components/dashboard/member/MemberHomePanel'
import { MemberProfilePanel } from '@/components/dashboard/member/MemberProfilePanel'
import { MemberTasksPanel } from '@/components/dashboard/member/MemberTasksPanel'
import { MemberTeamPanel } from '@/components/dashboard/member/MemberTeamPanel'
import { AmbientBackdrop } from '@/components/dashboard/shell/AmbientBackdrop'
import { GlassDashboardShell } from '@/components/dashboard/shell/GlassDashboardShell'
import { useAuth } from '@/context/auth-context'
import { useAccessControl } from '@/hooks/use-access-control'
import { useDashboardApplication } from '@/hooks/use-dashboard-application'
import { useNotificationAlerts } from '@/hooks/use-notification-alerts'
import { useOcWorkspace } from '@/hooks/use-oc-workspace'
import { useSingleSession } from '@/hooks/use-single-session'
import type { DashboardNavId } from '@/lib/dashboard/types'

const AdminPageClient = dynamic(() => import('../admin/page').then((m) => m.default), { ssr: false })

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()

  const [activeNav, setActiveNav] = useState<DashboardNavId>('home')
  const [editing, setEditing] = useState(false)
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('week')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showMemberProfile, setShowMemberProfile] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Record<string, unknown> | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null)
  const [selectedMember, setSelectedMember] = useState<Record<string, unknown> | null>(null)

  const { application, loading: appLoading, fetchApplication } = useDashboardApplication(user)
  const isAdmin = user?.role === 'admin'
  const { accessState } = useAccessControl(user, isAdmin)

  const isApplicationApproved = application?.status === 'approved'
  const displayName = String(application?.fullName ?? user?.displayName ?? '')
  const ocEnabled = Boolean(
    user && !isAdmin && isApplicationApproved && accessState === 'approved'
  )

  const ws = useOcWorkspace(user, ocEnabled, displayName)

  useSingleSession(user?.uid, Boolean(user && !authLoading))
  useNotificationAlerts(user?.uid, ocEnabled)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden">
        <AmbientBackdrop />
        <Loader2 className="relative z-10 h-10 w-10 animate-spin text-indigo-300" />
      </div>
    )
  }

  if (!user) return null

  if (isAdmin) return <AdminPageClient />

  if (appLoading || accessState === 'loading') {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden">
        <AmbientBackdrop />
        <Loader2 className="relative z-10 h-10 w-10 animate-spin text-indigo-300" />
      </div>
    )
  }

  if (accessState === 'pending') {
    return (
      <PendingAccessScreen onLogout={() => void logout().then(() => router.push('/login'))} />
    )
  }

  const taskBadge = ws.tasks.filter(
    (t) =>
      t.assignedTo?.includes(user.uid) &&
      t.status !== 'completed' &&
      new Date(t.dueDate) < new Date()
  ).length
  const teamBadge = ws.invitations.filter((i) => i.status === 'pending').length

  const memberMain = (
    <>
      {activeNav === 'home' && (
        <MemberHomePanel
          user={user}
          application={application}
          statistics={ws.statistics}
          tasks={ws.tasks}
          events={ws.events}
          onNavigate={setActiveNav}
          onAttend={ws.attendEvent}
        />
      )}
      {activeNav === 'tasks' && (
        <MemberTasksPanel
          user={user}
          tasks={ws.tasks}
          onNewTask={() => setShowNewTaskDialog(true)}
          onOpenTask={(task) => {
            setSelectedTask(task)
            setShowTaskDetails(true)
          }}
        />
      )}
      {activeNav === 'calendar' && (
        <MemberCalendarPanel
          events={ws.events}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          calendarView={calendarView}
          setCalendarView={setCalendarView}
          onNewEvent={() => setShowNewEventDialog(true)}
          onOpenEvent={(e) => {
            setSelectedEvent(e)
            setShowEventDetails(true)
          }}
        />
      )}
      {activeNav === 'team' && (
        <MemberTeamPanel
          members={ws.members}
          tasks={ws.tasks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onInvite={() => setShowInviteDialog(true)}
          onSelectMember={(m) => {
            setSelectedMember(m)
            setShowMemberProfile(true)
          }}
        />
      )}
      {activeNav === 'chat' && (
        <MemberChatPanel
          user={user}
          chatRooms={ws.chatRooms}
          activeChatRoom={ws.activeChatRoom}
          setActiveChatRoom={ws.setActiveChatRoom}
          messages={ws.messages}
          chatInput={ws.chatInput}
          setChatInput={ws.setChatInput}
          sendingMessage={ws.sendingMessage}
          showChatSidebar={ws.showChatSidebar}
          setShowChatSidebar={ws.setShowChatSidebar}
          typingUsers={ws.typingUsers}
          onSend={ws.sendMessage}
          onTyping={ws.sendTypingIndicator}
        />
      )}
      {activeNav === 'profile' && (
        <MemberProfilePanel
          user={user}
          application={application}
          members={ws.members}
          tasks={ws.tasks}
          events={ws.events}
          notifications={ws.notifications}
          onLogout={() => void logout().then(() => router.push('/login'))}
        />
      )}
    </>
  )

  return (
    <>
      {isApplicationApproved ? (
        <GlassDashboardShell
          active={activeNav}
          onNavigate={setActiveNav}
          taskBadge={taskBadge}
          teamBadge={teamBadge}
          userName={user.displayName}
          photoUrl={user.photoURL}
          onProfile={() => setActiveNav('profile')}
          onLogout={() => void logout().then(() => router.push('/login'))}
        >
          {memberMain}
        </GlassDashboardShell>
      ) : (
        <div className="relative min-h-svh overflow-hidden text-slate-100">
          <AmbientBackdrop />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <ApplicantPhaseView
              user={user}
              application={application}
              editing={editing}
              setEditing={setEditing}
              onRefresh={fetchApplication}
            />
          </motion.div>
        </div>
      )}

      <DashboardDialogs
        user={user}
        taskData={ws.taskData}
        setTaskData={ws.setTaskData}
        eventData={ws.eventData}
        setEventData={ws.setEventData}
        inviteData={ws.inviteData}
        setInviteData={ws.setInviteData}
        showNewTask={showNewTaskDialog}
        setShowNewTask={setShowNewTaskDialog}
        showNewEvent={showNewEventDialog}
        setShowNewEvent={setShowNewEventDialog}
        showInvite={showInviteDialog}
        setShowInvite={setShowInviteDialog}
        showTaskDetails={showTaskDetails}
        setShowTaskDetails={setShowTaskDetails}
        showEventDetails={showEventDetails}
        setShowEventDetails={setShowEventDetails}
        showMemberProfile={showMemberProfile}
        setShowMemberProfile={setShowMemberProfile}
        selectedTask={selectedTask}
        selectedEvent={selectedEvent}
        selectedMember={selectedMember}
        createTask={ws.createTask}
        createEvent={ws.createEvent}
        handleInviteMember={ws.handleInviteMember}
        updateTaskStatus={ws.updateTaskStatus}
        attendEvent={ws.attendEvent}
        resetTaskForm={ws.resetTaskForm}
        resetEventForm={ws.resetEventForm}
      />
    </>
  )
}
