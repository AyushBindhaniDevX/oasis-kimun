'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Home, Users, Calendar, CheckSquare, FileText, 
  MessageCircle, BarChart3, Settings, User,
  LogOut, Zap, Search, ShieldCheck, 
  Loader2, Download, ExternalLink, Clock,
  Plus, Filter, MoreVertical, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, Mail,
  Bell, Award, Target, TrendingUp, Upload,
  ChevronLeft, ChevronRight, CalendarDays,
  Briefcase, GraduationCap, Heart, Coffee,
  UserPlus, UserCheck, UserX, Send,
  RefreshCw, ChevronDown, X,
  DownloadCloud, UploadCloud, Printer,
  AlertTriangle, CheckCheck, Menu,
  LayoutDashboard, PieChart, BookOpen,
  Video, Phone, MapPin, Globe,
  Linkedin, Github, Twitter,
  ThumbsUp, ThumbsDown, HelpCircle,
  Flag, Star, Copy, Eye, EyeOff,
  Maximize2, Minimize2, Save,
  Info, MessageSquare, Moon, Sun,
  ChevronUp, PlusCircle, MinusCircle,
  Archive, FolderOpen, Image, Paperclip,
  Link2, Lock, Unlock, Wifi, WifiOff
} from 'lucide-react'
import { ref, onValue, update, set, remove, push } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { evaluateApplication } from '@/lib/ai-service'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { MessagingDialog } from '@/components/messaging-dialog'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// --- Interfaces ---
interface InterviewDetails {
  status?: 'pending' | 'scheduled' | 'cancelled' | 'completed'
  phaseStartedAt?: string
  slotStart?: string
  slotEnd?: string
  timeZone?: string
  calBookingId?: string
  calBookingUrl?: string
  bookedAt?: string
  completedAt?: string
  feedback?: InterviewFeedback
  interviewer?: string
  meetingLink?: string
}

interface InterviewFeedback {
  rating: number
  strengths: string[]
  weaknesses: string[]
  notes: string
  interviewer: string
  submittedAt: string
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
}

interface Application {
  uid: string
  fullName: string
  email: string
  phone?: string
  school: string
  major?: string
  graduationYear?: string
  ocRole: string
  committee?: string
  previousExperience?: string
  skills?: string[]
  languages?: string[]
  availability?: {
    weekdays: string[]
    weekend: boolean
    hoursPerWeek: number
  }
  motivation: string
  submittedAt: string
  status: 'pending' | 'under_review' | 'interview_phase' | 'approved' | 'rejected'
  aiScore?: number
  adminNotes?: string
  notes?: AdminNote[]
  photoURL?: string
  interview?: InterviewDetails
  documents?: {
    cv?: string
    portfolio?: string
    letter?: string
  }
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  reviewedBy?: string
  reviewedAt?: string
}

interface AdminNote {
  id: string
  content: string
  createdBy: string
  createdByName: string
  createdAt: string
  type: 'general' | 'important' | 'feedback'
}

interface InterviewSlot {
  id: string
  start: string
  end: string
  available: boolean
  bookedBy?: string
  bookingUrl?: string
  type: 'in_person' | 'video'
  location?: string
  meetingLink?: string
  capacity?: number
  bookedCount?: number
}

interface OCMember {
  uid: string
  fullName: string
  email: string
  role: string
  committee: string
  avatar?: string
  joinedAt: string
  status: 'active' | 'inactive' | 'on_leave' | 'pending'
  permissions: string[]
  tasks?: number
  events?: number
  phone?: string
  bio?: string
  applicationId?: string
  invitedBy?: string
  invitedAt?: string
  lastActive?: string
}

interface Invitation {
  id: string
  email: string
  fullName: string
  role: string
  committee: string
  invitedBy: string
  invitedByName: string
  invitedAt: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  token: string
  applicationId?: string
}

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string[]
  assignedToNames?: string[]
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  createdBy: string
  createdByName: string
  createdAt: string
  completedAt?: string
  completedBy?: string
  attachments?: string[]
  comments?: Comment[]
  tags?: string[]
  category?: string
  estimatedHours?: number
  actualHours?: number
  dependsOn?: string[]
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
  attachments?: string[]
  mentions?: string[]
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  type: 'meeting' | 'deadline' | 'training' | 'social' | 'interview' | 'review'
  startDate: string
  endDate: string
  allDay?: boolean
  location?: string
  onlineLink?: string
  attendees: string[]
  attendeeNames?: string[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt?: string
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
  color?: string
  reminders?: {
    email: boolean
    push: boolean
    time: number
  }
}

interface Document {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'xls' | 'ppt' | 'image' | 'other'
  size: number
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  url: string
  category: 'guideline' | 'template' | 'report' | 'minutes' | 'resource' | 'other'
  tags?: string[]
  version?: number
  accessLevel: 'public' | 'committee' | 'admin' | 'private'
  sharedWith?: string[]
}

interface Statistics {
  totalApplications: number
  pendingReview: number
  interviewPhase: number
  approved: number
  rejected: number
  averageScore: number
  applicationsByDay: { date: string; count: number }[]
  statusDistribution: Record<string, number>
  roleDistribution: Record<string, number>
  schoolDistribution: Record<string, number>
  interviewCompletionRate: number
  averageResponseTime: number
  topPerformers: Application[]
  recentActivity: Activity[]
  teamStats: {
    totalMembers: number
    activeMembers: number
    pendingInvites: number
    byCommittee: Record<string, number>
    byRole: Record<string, number>
  }
  taskStats: {
    total: number
    completed: number
    overdue: number
  }
  eventStats: {
    upcoming: number
    total: number
  }
}

interface Activity {
  id: string
  type: 'status_change' | 'interview_scheduled' | 'note_added' | 'document_uploaded' | 'ai_evaluated' | 'member_invited' | 'member_joined'
  userId: string
  userName: string
  targetId?: string
  targetName?: string
  details: string
  timestamp: string
}

interface TeamChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  text: string
  createdAt: string
}

const STATUS_THEMES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  interview_phase: 'bg-violet-50 text-violet-700 border-violet-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

const MEMBER_STATUS_THEMES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-50 text-slate-400 border-slate-200',
  on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
}

const PRIORITY_THEMES = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600',
  urgent: 'bg-rose-100 text-rose-600',
}

const EVENT_COLORS = {
  meeting: 'bg-blue-100 text-blue-600 border-blue-200',
  deadline: 'bg-amber-100 text-amber-600 border-amber-200',
  training: 'bg-violet-100 text-violet-600 border-violet-200',
  social: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  interview: 'bg-purple-100 text-purple-600 border-purple-200',
  review: 'bg-indigo-100 text-indigo-600 border-indigo-200',
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'applications', label: 'Apps', icon: FileText },
  { id: 'members', label: 'Team', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // Data states
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [ocMembers, setOcMembers] = useState<OCMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [interviewSlots, setInterviewSlots] = useState<InterviewSlot[]>([])
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalApplications: 0,
    pendingReview: 0,
    interviewPhase: 0,
    approved: 0,
    rejected: 0,
    averageScore: 0,
    applicationsByDay: [],
    statusDistribution: {},
    roleDistribution: {},
    schoolDistribution: {},
    interviewCompletionRate: 0,
    averageResponseTime: 0,
    topPerformers: [],
    recentActivity: [],
    teamStats: {
      totalMembers: 0,
      activeMembers: 0,
      pendingInvites: 0,
      byCommittee: {},
      byRole: {}
    },
    taskStats: {
      total: 0,
      completed: 0,
      overdue: 0
    },
    eventStats: {
      upcoming: 0,
      total: 0
    }
  })

  // UI states
  const [appsLoading, setAppsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedMember, setSelectedMember] = useState<OCMember | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [showMemberDialog, setShowMemberDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showInvitationDetails, setShowInvitationDetails] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [showDocumentDetails, setShowDocumentDetails] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [showSlotDialog, setShowSlotDialog] = useState(false)
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [showMessagingDialog, setShowMessagingDialog] = useState(false)
  const [showProfileSheet, setShowProfileSheet] = useState(false)
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeNav, setActiveNav] = useState('dashboard')
  const [bulkStatus, setBulkStatus] = useState<Application['status']>('pending')
  const [noteContent, setNoteContent] = useState('')
  const [noteType, setNoteType] = useState<'general' | 'important' | 'feedback'>('general')
  const [slotData, setSlotData] = useState<Partial<InterviewSlot>>({
    type: 'video',
    available: true,
    capacity: 1
  })
  const [taskData, setTaskData] = useState<Partial<Task>>({
    priority: 'medium',
    status: 'todo'
  })
  const [teamChatInput, setTeamChatInput] = useState('')
  const [sendingTeamChat, setSendingTeamChat] = useState(false)
  const [eventData, setEventData] = useState<Partial<CalendarEvent>>({
    type: 'meeting',
    allDay: false
  })
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [inviteData, setInviteData] = useState({
    email: '',
    fullName: '',
    role: '',
    committee: '',
    applicationId: '',
    sendEmail: true
  })
  const [availableApplications, setAvailableApplications] = useState<Application[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  // --- Data Fetching ---
  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    const db = getDatabase()
    
    // Fetch applications
    const unsubscribeApps = onValue(ref(db, 'applications'), (snapshot) => {
      const data: Application[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ uid: child.key as string, ...child.val() })
        })
      }
      setApplications(data)
      const approvedApps = data.filter(app => app.status === 'approved')
      setAvailableApplications(approvedApps)
      setAppsLoading(false)
      calculateStatistics(data, tasks, events, ocMembers, invitations)
    })

    // Fetch OC members
    const unsubscribeMembers = onValue(ref(db, 'oc/members'), (snapshot) => {
      const data: OCMember[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ uid: child.key as string, ...child.val() })
        })
      }
      setOcMembers(data)
    })

    // Fetch invitations
    const unsubscribeInvitations = onValue(ref(db, 'oc/invitations'), (snapshot) => {
      const data: Invitation[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ id: child.key as string, ...child.val() })
        })
      }
      setInvitations(data)
    })

    // Fetch tasks
    const unsubscribeTasks = onValue(ref(db, 'oc/tasks'), (snapshot) => {
      const data: Task[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ id: child.key as string, ...child.val() })
        })
      }
      setTasks(data)
    })

    // Fetch events
    const unsubscribeEvents = onValue(ref(db, 'oc/events'), (snapshot) => {
      const data: CalendarEvent[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ id: child.key as string, ...child.val() })
        })
      }
      setEvents(data)
    })

    // Fetch documents
    const unsubscribeDocs = onValue(ref(db, 'oc/documents'), (snapshot) => {
      const data: Document[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ id: child.key as string, ...child.val() })
        })
      }
      setDocuments(data)
    })

    // Fetch interview slots
    const unsubscribeSlots = onValue(ref(db, 'interviewSlots'), (snapshot) => {
      const data: InterviewSlot[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ id: child.key as string, ...child.val() })
        })
      }
      setInterviewSlots(data)
    })

    // Fetch team chat messages
    const unsubscribeTeamChat = onValue(ref(db, 'oc/chats/general/messages'), (snapshot) => {
      const data: TeamChatMessage[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ id: child.key as string, ...child.val() })
        })
      }
      data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      setTeamChatMessages(data)
    })

    return () => {
      unsubscribeApps()
      unsubscribeMembers()
      unsubscribeInvitations()
      unsubscribeTasks()
      unsubscribeEvents()
      unsubscribeDocs()
      unsubscribeSlots()
      unsubscribeTeamChat()
    }
  }, [user, router, authLoading])

  // --- Filtering ---
  useEffect(() => {
    let filtered = [...applications]
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a => 
        a.fullName?.toLowerCase().includes(q) || 
        a.email?.toLowerCase().includes(q) ||
        a.school?.toLowerCase().includes(q) ||
        a.ocRole?.toLowerCase().includes(q)
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter)
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(a => a.ocRole === roleFilter)
    }
    
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      switch(dateFilter) {
        case 'today':
          filtered = filtered.filter(a => new Date(a.submittedAt).toDateString() === now.toDateString())
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(a => new Date(a.submittedAt) >= filterDate)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(a => new Date(a.submittedAt) >= filterDate)
          break
      }
    }
    
    setFilteredApplications(filtered)
  }, [applications, searchQuery, statusFilter, roleFilter, dateFilter])

  // --- Statistics Calculation ---
  const calculateStatistics = (apps: Application[], tsks: Task[], evts: CalendarEvent[], members: OCMember[], invites: Invitation[]) => {
    const statusDist: Record<string, number> = {}
    const roleDist: Record<string, number> = {}
    const schoolDist: Record<string, number> = {}
    const appsByDay: Record<string, number> = {}
    const committeeDist: Record<string, number> = {}
    const memberRoleDist: Record<string, number> = {}
    let totalScore = 0
    let scoredApps = 0

    apps.forEach(app => {
      statusDist[app.status] = (statusDist[app.status] || 0) + 1
      if (app.ocRole) roleDist[app.ocRole] = (roleDist[app.ocRole] || 0) + 1
      if (app.school) schoolDist[app.school] = (schoolDist[app.school] || 0) + 1
      if (app.submittedAt) {
        const date = new Date(app.submittedAt).toLocaleDateString()
        appsByDay[date] = (appsByDay[date] || 0) + 1
      }
      if (app.aiScore) {
        totalScore += app.aiScore
        scoredApps++
      }
    })

    members.forEach(member => {
      committeeDist[member.committee] = (committeeDist[member.committee] || 0) + 1
      memberRoleDist[member.role] = (memberRoleDist[member.role] || 0) + 1
    })

    const interviewPhaseApps = apps.filter(a => a.status === 'interview_phase').length
    const completedInterviews = apps.filter(a => a.interview?.status === 'completed').length
    const interviewRate = interviewPhaseApps > 0 ? (completedInterviews / interviewPhaseApps) * 100 : 0

    const topPerformers = [...apps]
      .filter(a => a.aiScore)
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, 5)

    const recentActivity: Activity[] = [
      ...apps.flatMap(app => {
        const activities: Activity[] = []
        if (app.reviewedAt) {
          activities.push({
            id: `status-${app.uid}-${app.reviewedAt}`,
            type: 'status_change',
            userId: app.reviewedBy || 'system',
            userName: 'System',
            targetId: app.uid,
            targetName: app.fullName,
            details: `Status changed to ${app.status}`,
            timestamp: app.reviewedAt
          })
        }
        if (app.interview?.bookedAt) {
          activities.push({
            id: `interview-${app.uid}-${app.interview.bookedAt}`,
            type: 'interview_scheduled',
            userId: app.uid,
            userName: app.fullName,
            targetId: app.uid,
            targetName: app.fullName,
            details: 'Interview scheduled',
            timestamp: app.interview.bookedAt
          })
        }
        return activities
      }),
      ...invites.map(invite => ({
        id: `invite-${invite.id}`,
        type: 'member_invited' as const,
        userId: invite.invitedBy,
        userName: invite.invitedByName,
        targetId: invite.id,
        targetName: invite.fullName,
        details: `Invited ${invite.fullName} as ${invite.role}`,
        timestamp: invite.invitedAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    setStatistics({
      totalApplications: apps.length,
      pendingReview: apps.filter(a => a.status === 'pending').length,
      interviewPhase: interviewPhaseApps,
      approved: apps.filter(a => a.status === 'approved').length,
      rejected: apps.filter(a => a.status === 'rejected').length,
      averageScore: scoredApps > 0 ? Math.round(totalScore / scoredApps) : 0,
      applicationsByDay: Object.entries(appsByDay).map(([date, count]) => ({ date, count })),
      statusDistribution: statusDist,
      roleDistribution: roleDist,
      schoolDistribution: schoolDist,
      interviewCompletionRate: Math.round(interviewRate),
      averageResponseTime: 3.5,
      topPerformers,
      recentActivity,
      teamStats: {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        pendingInvites: invites.filter(i => i.status === 'pending').length,
        byCommittee: committeeDist,
        byRole: memberRoleDist
      },
      taskStats: {
        total: tsks.length,
        completed: tsks.filter(t => t.status === 'completed').length,
        overdue: tsks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length
      },
      eventStats: {
        total: evts.length,
        upcoming: evts.filter(e => new Date(e.startDate) > new Date()).length
      }
    })
  }

  // --- Action Handlers ---
  const handleAiEvaluate = async (app: Application) => {
    setEvaluatingId(app.uid)
    try {
      const result = await evaluateApplication(app)
      const db = getDatabase()
      await update(ref(db, `applications/${app.uid}`), { 
        aiScore: result.score, 
        status: 'under_review',
        reviewedBy: user?.uid,
        reviewedAt: new Date().toISOString()
      })
      toast.success(`AI Evaluation Complete: ${result.score}/100`)
      await addActivity('ai_evaluated', `AI evaluated ${app.fullName}`, app.uid, app.fullName)
    } catch (error) { 
      toast.error("AI Evaluation Failed") 
    } finally { 
      setEvaluatingId(null) 
    }
  }

  const handleBulkEvaluate = async () => {
    if (selectedApps.length === 0) {
      toast.error('Select at least one application')
      return
    }
    
    setEvaluatingId('bulk')
    try {
      for (const uid of selectedApps) {
        const app = applications.find(a => a.uid === uid)
        if (app && !app.aiScore) {
          const result = await evaluateApplication(app)
          const db = getDatabase()
          await update(ref(db, `applications/${uid}`), { 
            aiScore: result.score, 
            status: 'under_review'
          })
        }
      }
      toast.success(`Evaluated ${selectedApps.length} applications`)
      setSelectedApps([])
      setShowBulkActionDialog(false)
    } catch (error) {
      toast.error('Bulk evaluation failed')
    } finally {
      setEvaluatingId(null)
    }
  }

  const handleStatusChange = async (uid: string, newStatus: Application['status'], skipInterview: boolean = false) => {
    const db = getDatabase()
    const app = applications.find(a => a.uid === uid)
    
    try {
      if (newStatus === 'approved') {
        if (skipInterview) {
          await update(ref(db, `applications/${uid}`), {
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: user?.uid,
            notes: [
              ...(app?.notes || []),
              {
                id: Date.now().toString(),
                content: 'Approved directly without interview',
                createdBy: user?.uid || '',
                createdByName: user?.displayName || 'Admin',
                createdAt: new Date().toISOString(),
                type: 'important'
              }
            ]
          })
          toast.success('Applicant approved directly to OC')
        } else {
          await update(ref(db, `applications/${uid}`), {
            status: 'interview_phase',
            approvedAt: new Date().toISOString(),
            interview: {
              status: 'pending',
              phaseStartedAt: new Date().toISOString()
            }
          })
          toast.success('Applicant moved to Interview Phase')
        }
      } else if (newStatus === 'rejected') {
        await update(ref(db, `applications/${uid}`), {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: user?.uid
        })
        toast.success('Application rejected')
      } else {
        await update(ref(db, `applications/${uid}`), { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
        toast.success("Status Updated")
      }
      
      await addActivity('status_change', `Status changed to ${newStatus}`, uid, app?.fullName)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleBulkStatusChange = async () => {
    if (selectedApps.length === 0) {
      toast.error('Select at least one application')
      return
    }
    
    try {
      const db = getDatabase()
      for (const uid of selectedApps) {
        await update(ref(db, `applications/${uid}`), { 
          status: bulkStatus,
          updatedAt: new Date().toISOString()
        })
      }
      toast.success(`Updated ${selectedApps.length} applications`)
      setSelectedApps([])
      setShowBulkActionDialog(false)
    } catch (error) {
      toast.error('Bulk update failed')
    }
  }

  const handleInviteMember = async () => {
    if (!inviteData.email || !inviteData.fullName || !inviteData.role || !inviteData.committee) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const db = getDatabase()
      const invitesRef = ref(db, 'oc/invitations')
      const newInviteRef = push(invitesRef)
      
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const invitation: Invitation = {
        id: newInviteRef.key!,
        email: inviteData.email,
        fullName: inviteData.fullName,
        role: inviteData.role,
        committee: inviteData.committee,
        invitedBy: user?.uid || '',
        invitedByName: user?.displayName || 'Admin',
        invitedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: 'pending',
        token: token,
        applicationId: inviteData.applicationId || undefined
      }

      await set(newInviteRef, invitation)

      if (inviteData.sendEmail) {
        console.log('Sending invitation email to:', inviteData.email)
      }

      await addActivity('member_invited', `Invited ${inviteData.fullName} as ${inviteData.role}`)

      toast.success('Invitation sent successfully')
      setShowInviteDialog(false)
      setInviteData({
        email: '',
        fullName: '',
        role: '',
        committee: '',
        applicationId: '',
        sendEmail: true
      })

    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error('Failed to send invitation')
    }
  }

  const handleResendInvite = async (invitation: Invitation) => {
    try {
      const db = getDatabase()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      await update(ref(db, `oc/invitations/${invitation.id}`), {
        expiresAt: expiresAt.toISOString(),
        status: 'pending'
      })

      toast.success('Invitation resent successfully')
    } catch (error) {
      toast.error('Failed to resend invitation')
    }
  }

  const handleCancelInvite = async (invitationId: string) => {
    try {
      const db = getDatabase()
      await update(ref(db, `oc/invitations/${invitationId}`), {
        status: 'cancelled'
      })
      toast.success('Invitation cancelled')
    } catch (error) {
      toast.error('Failed to cancel invitation')
    }
  }

  const handleUpdateMemberStatus = async (memberId: string, status: OCMember['status']) => {
    try {
      const db = getDatabase()
      await update(ref(db, `oc/members/${memberId}`), {
        status: status,
        updatedAt: new Date().toISOString()
      })
      toast.success(`Member status updated to ${status}`)
    } catch (error) {
      toast.error('Failed to update member status')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the OC?')) return

    try {
      const db = getDatabase()
      await remove(ref(db, `oc/members/${memberId}`))
      toast.success('Member removed successfully')
    } catch (error) {
      toast.error('Failed to remove member')
    }
  }

  const handleBulkInvite = async () => {
    if (selectedApps.length === 0) {
      toast.error('Select at least one approved applicant')
      return
    }

    try {
      const db = getDatabase()
      const selectedApplicants = applications.filter(app => 
        selectedApps.includes(app.uid) && app.status === 'approved'
      )

      for (const app of selectedApplicants) {
        const invitesRef = ref(db, 'oc/invitations')
        const newInviteRef = push(invitesRef)
        
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const invitation: Invitation = {
          id: newInviteRef.key!,
          email: app.email,
          fullName: app.fullName,
          role: app.ocRole,
          committee: app.committee || 'General',
          invitedBy: user?.uid || '',
          invitedByName: user?.displayName || 'Admin',
          invitedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          status: 'pending',
          token: token,
          applicationId: app.uid
        }

        await set(newInviteRef, invitation)
      }

      toast.success(`Invited ${selectedApps.length} members`)
      setSelectedApps([])
      setShowBulkActionDialog(false)
    } catch (error) {
      toast.error('Failed to send bulk invitations')
    }
  }

  const handleAddNote = async () => {
    if (!selectedApplication || !noteContent.trim()) return
    
    const newNote: AdminNote = {
      id: Date.now().toString(),
      content: noteContent,
      createdBy: user?.uid || '',
      createdByName: user?.displayName || 'Admin',
      createdAt: new Date().toISOString(),
      type: noteType
    }
    
    try {
      const db = getDatabase()
      const existingNotes = selectedApplication.notes || []
      await update(ref(db, `applications/${selectedApplication.uid}`), {
        notes: [...existingNotes, newNote]
      })
      
      toast.success('Note added')
      setNoteContent('')
      setNoteType('general')
      setShowNoteDialog(false)
      
      await addActivity('note_added', `Note added to ${selectedApplication.fullName}`, selectedApplication.uid, selectedApplication.fullName)
    } catch (error) {
      toast.error('Failed to add note')
    }
  }

  const handleCreateInterviewSlot = async () => {
    if (!slotData.start || !slotData.end) {
      toast.error('Please select start and end times')
      return
    }
    
    try {
      const db = getDatabase()
      const slotRef = push(ref(db, 'interviewSlots'))
      await set(slotRef, {
        ...slotData,
        id: slotRef.key,
        available: true,
        bookedCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid
      })
      
      toast.success('Interview slot created')
      setShowSlotDialog(false)
      setSlotData({ type: 'video', available: true, capacity: 1 })
    } catch (error) {
      toast.error('Failed to create slot')
    }
  }

  const handleCreateTask = async () => {
    if (!taskData.title) {
      toast.error('Please enter a task title')
      return
    }
    
    try {
      const db = getDatabase()
      const taskRef = push(ref(db, 'oc/tasks'))
      const newTask: Task = {
        id: taskRef.key || '',
        title: taskData.title || '',
        description: taskData.description || '',
        assignedTo: taskData.assignedTo || [],
        assignedToNames: (taskData.assignedTo || []).map(id => {
          const member = ocMembers.find(m => m.uid === id)
          return member?.fullName || id
        }),
        dueDate: taskData.dueDate || new Date().toISOString(),
        priority: taskData.priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
        status: taskData.status as 'todo' | 'in_progress' | 'review' | 'completed' || 'todo',
        createdBy: user?.uid || '',
        createdByName: user?.displayName || 'Admin',
        createdAt: new Date().toISOString(),
        tags: taskData.tags || []
      }
      
      await set(taskRef, newTask)
      toast.success('Task created')
      setShowTaskDialog(false)
      setTaskData({ priority: 'medium', status: 'todo' })
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleCreateEvent = async () => {
    if (!eventData.title || !eventData.startDate || !eventData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const db = getDatabase()
      const eventRef = push(ref(db, 'oc/events'))
      const newEvent: CalendarEvent = {
        id: eventRef.key || '',
        title: eventData.title || '',
        description: eventData.description || '',
        type: eventData.type as 'meeting' | 'deadline' | 'training' | 'social' | 'interview' | 'review' || 'meeting',
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        allDay: eventData.allDay || false,
        location: eventData.location,
        onlineLink: eventData.onlineLink,
        attendees: eventData.attendees || [],
        attendeeNames: (eventData.attendees || []).map(id => {
          const member = ocMembers.find(m => m.uid === id)
          return member?.fullName || id
        }),
        createdBy: user?.uid || '',
        createdByName: user?.displayName || 'Admin',
        createdAt: new Date().toISOString(),
        color: eventData.color
      }
      
      await set(eventRef, newEvent)
      toast.success('Event created')
      setShowEventDialog(false)
      setEventData({ type: 'meeting', allDay: false })
    } catch (error) {
      toast.error('Failed to create event')
    }
  }

  const handleUploadDocument = async () => {
    if (!documentFile) {
      toast.error('Please select a file')
      return
    }
    
    try {
      const db = getDatabase()
      const docRef = push(ref(db, 'oc/documents'))
      const newDoc: Document = {
        id: docRef.key || '',
        name: documentFile.name,
        type: documentFile.type.split('/')[1] as any || 'other',
        size: documentFile.size,
        uploadedBy: user?.uid || '',
        uploadedByName: user?.displayName || 'Admin',
        uploadedAt: new Date().toISOString(),
        url: '#',
        category: 'other',
        accessLevel: 'admin'
      }
      
      await set(docRef, newDoc)
      toast.success('Document uploaded')
      setShowDocumentDialog(false)
      setDocumentFile(null)
    } catch (error) {
      toast.error('Failed to upload document')
    }
  }

  const handleDeleteApplication = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    
    try {
      const db = getDatabase()
      await remove(ref(db, `applications/${uid}`))
      toast.success('Application deleted')
    } catch (error) {
      toast.error('Failed to delete application')
    }
  }

  const handleExportData = () => {
    try {
      const data = applications.map(app => ({
        Name: app.fullName,
        Email: app.email,
        School: app.school,
        Role: app.ocRole,
        Status: app.status,
        'AI Score': app.aiScore || 'N/A',
        Submitted: new Date(app.submittedAt).toLocaleDateString(),
        Interview: app.interview?.status || 'N/A'
      }))
      
      const csv = convertToCSV(data)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `applications_export_${new Date().toISOString()}.csv`
      a.click()
      
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const generatePDFReport = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('OASIS Admin Report', 20, 20)
    
    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
    doc.text(`Total Applications: ${statistics.totalApplications}`, 20, 40)
    doc.text(`Pending Review: ${statistics.pendingReview}`, 20, 45)
    doc.text(`Interview Phase: ${statistics.interviewPhase}`, 20, 50)
    doc.text(`Approved: ${statistics.approved}`, 20, 55)
    doc.text(`Rejected: ${statistics.rejected}`, 20, 60)
    doc.text(`Average AI Score: ${statistics.averageScore}%`, 20, 65)
    
    autoTable(doc, {
      head: [['Name', 'Email', 'Role', 'Status', 'Score']],
      body: filteredApplications.slice(0, 20).map(app => [
        app.fullName,
        app.email,
        app.ocRole,
        app.status,
        app.aiScore?.toString() || 'N/A'
      ]),
      startY: 70
    })
    
    doc.save(`oasis_report_${new Date().toISOString()}.pdf`)
  }

  const addActivity = async (type: Activity['type'], details: string, targetId?: string, targetName?: string) => {
    console.log('Activity:', { type, details, targetId, targetName })
  }

  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0])
    const rows = data.map(obj => headers.map(header => obj[header]).join(','))
    return [headers.join(','), ...rows].join('\n')
  }

  const downloadPDF = (app: Application) => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Application Details', 20, 20)
    
    doc.setFontSize(12)
    doc.text(`Name: ${app.fullName}`, 20, 35)
    doc.text(`Email: ${app.email}`, 20, 42)
    doc.text(`School: ${app.school}`, 20, 49)
    doc.text(`Role: ${app.ocRole}`, 20, 56)
    doc.text(`Status: ${app.status}`, 20, 63)
    doc.text(`AI Score: ${app.aiScore || 'N/A'}`, 20, 70)
    
    if (app.interview?.slotStart) {
      doc.text(`Interview: ${new Date(app.interview.slotStart).toLocaleString()}`, 20, 77)
    }
    
    doc.text('Motivation:', 20, 91)
    const splitText = doc.splitTextToSize(app.motivation, 170)
    doc.text(splitText, 20, 98)
    
    doc.save(`${app.fullName}_application.pdf`)
  }

  const toggleSelectAll = () => {
    if (selectedApps.length === filteredApplications.length) {
      setSelectedApps([])
    } else {
      setSelectedApps(filteredApplications.map(a => a.uid))
    }
  }

  const toggleSelectApp = (uid: string) => {
    setSelectedApps(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    )
  }

  const getUniqueRoles = () => {
    const roles = new Set(applications.map(a => a.ocRole).filter(Boolean))
    return Array.from(roles)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getTasksForMember = (memberId: string) => {
    return tasks.filter(t => t.assignedTo.includes(memberId))
  }

  const sendTeamChatMessage = async () => {
    if (!user || !teamChatInput.trim()) return

    setSendingTeamChat(true)
    try {
      const db = getDatabase()
      const messageRef = push(ref(db, 'oc/chats/general/messages'))
      await set(messageRef, {
        senderId: user.uid,
        senderName: user.displayName || 'Admin',
        senderAvatar: user.photoURL || '',
        text: teamChatInput.trim(),
        createdAt: new Date().toISOString(),
      })
      setTeamChatInput('')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSendingTeamChat(false)
    }
  }

  const approvedApplications = applications.filter(app => app.status === 'approved')
  const approvedMembers = ocMembers.filter(member => member.status === 'active' || member.status === 'on_leave')
  const pendingInvites = invitations.filter(inv => inv.status === 'pending')
  const scheduledInterviews = applications.filter(app => app.interview?.status === 'scheduled' && app.interview?.slotStart)

  if (authLoading || appsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading OASIS Admin...</p>
        </div>
      </div>
    )
  }

  // Render content based on active navigation
  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return (
          <div className="space-y-4 p-4 pb-24">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.displayName?.split(' ')[0]}! 👋</h2>
                    <p className="text-blue-100 text-sm">KIMUN 2026 • Digital Secretariat</p>
                  </div>
                  <Avatar className="h-16 w-16 border-4 border-white/30">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-blue-800 text-white text-xl">
                      {user?.displayName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Applications</span>
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{statistics.totalApplications}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {statistics.pendingReview} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Members</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold">{statistics.teamStats.activeMembers}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {statistics.teamStats.pendingInvites} invites
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Tasks</span>
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold">{statistics.taskStats.completed}/{statistics.taskStats.total}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {statistics.taskStats.overdue} overdue
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Events</span>
                    <Calendar className="w-4 h-4 text-violet-600" />
                  </div>
                  <p className="text-2xl font-bold">{statistics.eventStats.upcoming}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    upcoming
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'urgent' ? 'bg-rose-500' :
                      task.priority === 'high' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-xs font-medium">{task.title}</p>
                      <p className="text-[10px] text-slate-400">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Badge className="text-[9px]" variant="outline">
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4" onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
              <Button variant="outline" className="h-auto py-4" onClick={() => setShowTaskDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Top Performers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statistics.topPerformers.map((app: any, i) => (
                  <div key={app.uid} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {app.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{app.fullName}</p>
                      <p className="text-[9px] text-slate-400">{app.ocRole}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {app.aiScore}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )

      case 'applications':
        return (
          <div className="space-y-4 p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Applications</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => setShowSlotDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slot
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search applicants..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Review</SelectItem>
                    <SelectItem value="interview_phase">Interview</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {getUniqueRoles().map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={() => setShowBulkActionDialog(true)}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <Card key={app.uid} className="border-slate-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedApps.includes(app.uid)}
                        onCheckedChange={() => toggleSelectApp(app.uid)}
                        className="mt-1"
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={app.photoURL} />
                        <AvatarFallback>{app.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{app.fullName}</p>
                            <p className="text-xs text-slate-400">{app.email}</p>
                          </div>
                          <Badge className={`text-[9px] ${STATUS_THEMES[app.status]}`}>
                            {app.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[9px]">
                            {app.ocRole}
                          </Badge>
                          <span className="text-[9px] text-slate-400">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {app.aiScore && (
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={app.aiScore} className="h-1 flex-1" />
                            <span className="text-xs font-bold text-blue-600">{app.aiScore}%</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              setSelectedApplication(app)
                              setShowApplicationDialog(true)
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAiEvaluate(app)}>
                                <Zap className="w-3 h-3 mr-2" />
                                AI Evaluate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(app.uid, 'approved', true)}>
                                <CheckCircle className="w-3 h-3 mr-2 text-emerald-600" />
                                Approve Directly
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(app.uid, 'approved', false)}>
                                <Calendar className="w-3 h-3 mr-2 text-violet-600" />
                                Move to Interview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedApplication(app)
                                setShowNoteDialog(true)
                              }}>
                                <MessageSquare className="w-3 h-3 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadPDF(app)}>
                                <Download className="w-3 h-3 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteApplication(app.uid)}
                                className="text-rose-600"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No applications found</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'members':
        return (
          <div className="space-y-4 p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Team Members</h2>
                <p className="text-xs text-slate-400">
                  {approvedMembers.length} active • {pendingInvites.length} pending
                </p>
              </div>
              <Button size="sm" onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search members..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {approvedMembers
                .filter(m => 
                  searchQuery === '' || 
                  m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(member => (
                  <Card 
                    key={member.uid} 
                    className="border-slate-100 cursor-pointer hover:shadow-md transition"
                    onClick={() => {
                      setSelectedMember(member)
                      setShowMemberDialog(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{member.fullName}</p>
                              <p className="text-xs text-slate-400">{member.role}</p>
                            </div>
                            <Badge variant="outline" className={MEMBER_STATUS_THEMES[member.status]}>
                              {member.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[9px]">
                              {member.committee}
                            </Badge>
                            <span className="text-[9px] text-slate-400">
                              {getTasksForMember(member.uid).length} tasks
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Pending Invitations */}
            {pendingInvites.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Pending Invitations</h3>
                <div className="space-y-3">
                  {pendingInvites.map(invite => (
                    <Card key={invite.id} className="border-dashed border-2 border-blue-200 bg-blue-50/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{invite.fullName}</p>
                                <p className="text-xs text-slate-400">{invite.email}</p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                Pending
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-white text-[9px]">
                                {invite.role}
                              </Badge>
                              <Badge variant="outline" className="bg-white text-[9px]">
                                {invite.committee}
                              </Badge>
                            </div>
                            <p className="text-[9px] text-amber-600 mt-2">
                              Expires {new Date(invite.expiresAt).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 flex-1"
                                onClick={() => handleResendInvite(invite)}
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Resend
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-rose-600"
                                onClick={() => handleCancelInvite(invite.id)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'calendar':
        return (
          <div className="space-y-4 p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() - 1)
                    setSelectedDate(newDate)
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-bold">
                  {format(selectedDate, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() + 1)
                    setSelectedDate(newDate)
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button size="sm" onClick={() => setShowEventDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Calendar Grid */}
            <Card>
              <CardContent className="p-3">
                <div className="grid grid-cols-7 gap-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`} className="text-center text-xs font-medium text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: 35 }).map((_, i) => {
                    const date = new Date(selectedDate)
                    date.setDate(1)
                    const firstDay = date.getDay() || 7
                    date.setDate(i - firstDay + 2)
                    
                    const dayEvents = getEventsForDate(date)
                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                    const isToday = isSameDay(date, new Date())
                    
                    return (
                      <div
                        key={i}
                        className={`min-h-[60px] p-1 border border-slate-100 rounded-lg ${
                          isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'
                        } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <span className={`text-xs font-medium ${
                          isCurrentMonth ? 'text-slate-900' : 'text-slate-300'
                        }`}>
                          {date.getDate()}
                        </span>
                        
                        <div className="space-y-0.5 mt-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-[6px] p-0.5 rounded truncate ${EVENT_COLORS[event.type]}`}
                            >
                                                            {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[6px] text-slate-400">
                              +{dayEvents.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events
                  .filter(e => new Date(e.startDate) > new Date())
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${EVENT_COLORS[event.type]}`}>
                        {event.type === 'meeting' && <Users className="w-4 h-4" />}
                        {event.type === 'deadline' && <Clock className="w-4 h-4" />}
                        {event.type === 'training' && <BookOpen className="w-4 h-4" />}
                        {event.type === 'social' && <Coffee className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(event.startDate), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[9px]">
                        {event.attendees.length} attending
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        )

      case 'tasks':
        return (
          <div className="space-y-4 p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Tasks</h2>
              <Button size="sm" onClick={() => setShowTaskDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Task Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{statistics.taskStats.total}</p>
                  <p className="text-[9px] text-slate-400">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{statistics.taskStats.completed}</p>
                  <p className="text-[9px] text-slate-400">Done</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-rose-600">{statistics.taskStats.overdue}</p>
                  <p className="text-[9px] text-slate-400">Overdue</p>
                </CardContent>
              </Card>
            </div>

            {/* Task Lists by Status */}
            <Tabs defaultValue="todo" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="todo" className="text-xs">To Do</TabsTrigger>
                <TabsTrigger value="in_progress" className="text-xs">Doing</TabsTrigger>
                <TabsTrigger value="review" className="text-xs">Review</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Done</TabsTrigger>
              </TabsList>

              {['todo', 'in_progress', 'review', 'completed'].map(status => (
                <TabsContent key={status} value={status} className="space-y-3">
                  {tasks
                    .filter(t => t.status === status)
                    .map(task => (
                      <Card 
                        key={task.id} 
                        className="border-slate-100 cursor-pointer hover:shadow-md transition"
                        onClick={() => {
                          setSelectedTask(task)
                          setShowTaskDetails(true)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium flex-1">{task.title}</h3>
                            <Badge className={`text-[9px] ${PRIORITY_THEMES[task.priority]}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {task.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              {format(new Date(task.dueDate), 'MMM d')}
                            </div>
                            <div className="flex -space-x-2">
                              {task.assignedTo.slice(0, 3).map(id => {
                                const member = ocMembers.find(m => m.uid === id)
                                return (
                                  <Avatar key={id} className="h-5 w-5 border-2 border-white">
                                    <AvatarFallback className="text-[8px]">
                                      {member?.fullName?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                )
                              })}
                              {task.assignedTo.length > 3 && (
                                <span className="h-5 w-5 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-medium">
                                  +{task.assignedTo.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {tasks.filter(t => t.status === status).length === 0 && (
                    <div className="text-center py-8">
                      <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No tasks in this column</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )

      case 'chat':
        return (
          <div className="flex flex-col h-[calc(100vh-120px)] p-4 pb-24">
            <h2 className="text-lg font-bold mb-4">Team Chat</h2>
            
            <Card className="flex-1 flex flex-col">
              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                  <div className="space-y-4">
                    {teamChatMessages.map((message) => {
                      const isMine = message.senderId === user?.uid
                      return (
                        <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-3 ${
                            isMine ? 'bg-blue-600 text-white' : 'bg-slate-100'
                          }`}>
                            {!isMine && (
                              <p className="text-[10px] font-semibold mb-1 text-slate-500">
                                {message.senderName}
                              </p>
                            )}
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-[8px] mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                              {format(new Date(message.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={teamChatInput}
                    onChange={(e) => setTeamChatInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendTeamChatMessage()
                      }
                    }}
                  />
                  <Button 
                    onClick={sendTeamChatMessage}
                    disabled={!teamChatInput.trim() || sendingTeamChat}
                    size="icon"
                  >
                    {sendingTeamChat ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-4 p-4 pb-24">
            {/* Profile Header */}
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white/30">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="bg-purple-800 text-white text-2xl">
                    {user?.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{user?.displayName}</h2>
                <p className="text-purple-100">{user?.email}</p>
                <Badge className="mt-3 bg-white/20 text-white border-0">
                  Administrator
                </Badge>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{statistics.totalApplications}</p>
                  <p className="text-xs text-slate-400">Applications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{statistics.teamStats.totalMembers}</p>
                  <p className="text-xs text-slate-400">Team Members</p>
                </CardContent>
              </Card>
            </div>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-slate-400">User ID</span>
                  <span className="text-sm font-mono">{user?.uid.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-slate-400">Joined</span>
                  <span className="text-sm">
                    {user?.metadata?.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-slate-400">Last Login</span>
                  <span className="text-sm">
                    {user?.metadata?.lastSignInTime 
                      ? new Date(user.metadata.lastSignInTime).toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-slate-50 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm">OASIS Admin</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setActiveNav('profile')}>
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {user?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            let badgeCount = 0
            
            if (item.id === 'applications') badgeCount = statistics.pendingReview
            if (item.id === 'members') badgeCount = statistics.teamStats.pendingInvites
            if (item.id === 'tasks') badgeCount = statistics.taskStats.overdue
            if (item.id === 'calendar') badgeCount = statistics.eventStats.upcoming

            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="absolute top-0 right-2 min-w-[16px] h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Dialogs - Keeping all existing dialogs */}
      
      {/* Application Details Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedApplication.photoURL} />
                    <AvatarFallback>{selectedApplication.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedApplication.fullName}</h3>
                    <p className="text-sm text-slate-400">{selectedApplication.email}</p>
                    {selectedApplication.phone && (
                      <p className="text-xs text-slate-400">{selectedApplication.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-400">School</Label>
                    <p className="text-sm font-medium">{selectedApplication.school}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Role</Label>
                    <p className="text-sm font-medium">{selectedApplication.ocRole}</p>
                  </div>
                  {selectedApplication.major && (
                    <div>
                      <Label className="text-xs text-slate-400">Major</Label>
                      <p className="text-sm font-medium">{selectedApplication.major}</p>
                    </div>
                  )}
                  {selectedApplication.graduationYear && (
                    <div>
                      <Label className="text-xs text-slate-400">Graduation Year</Label>
                      <p className="text-sm font-medium">{selectedApplication.graduationYear}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-xs text-slate-400">Motivation</Label>
                  <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                    {selectedApplication.motivation}
                  </p>
                </div>
                
                {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                  <div>
                    <Label className="text-xs text-slate-400">Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="bg-slate-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedApplication.notes && selectedApplication.notes.length > 0 && (
                  <div>
                    <Label className="text-xs text-slate-400">Admin Notes</Label>
                    <div className="space-y-2 mt-1">
                      {selectedApplication.notes.map(note => (
                        <div key={note.id} className="p-2 bg-slate-50 rounded-lg">
                          <p className="text-xs">{note.content}</p>
                          <p className="text-[9px] text-slate-400 mt-1">
                            {note.createdByName} • {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowMessagingDialog(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Applicant
                  </Button>
                  <Button
                    onClick={() => {
                      setShowApplicationDialog(false)
                      setShowNoteDialog(true)
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Member Details Dialog */}
      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="max-w-2xl">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Member Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMember.avatar} />
                    <AvatarFallback>{selectedMember.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedMember.fullName}</h3>
                    <p className="text-sm text-slate-400">{selectedMember.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className={MEMBER_STATUS_THEMES[selectedMember.status]}>
                        {selectedMember.status}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {selectedMember.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-400">Committee</Label>
                    <p className="text-sm font-medium">{selectedMember.committee}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Joined</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedMember.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedMember.phone && (
                    <div>
                      <Label className="text-xs text-slate-400">Phone</Label>
                      <p className="text-sm font-medium">{selectedMember.phone}</p>
                    </div>
                  )}
                  {selectedMember.lastActive && (
                    <div>
                      <Label className="text-xs text-slate-400">Last Active</Label>
                      <p className="text-sm font-medium">
                        {new Date(selectedMember.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {selectedMember.bio && (
                  <div>
                    <Label className="text-xs text-slate-400">Bio</Label>
                    <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                      {selectedMember.bio}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-slate-400">Assigned Tasks</Label>
                  <div className="space-y-2 mt-2">
                    {getTasksForMember(selectedMember.uid).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-slate-400">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                        <Badge className={PRIORITY_THEMES[task.priority]}>
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Select
                    value={selectedMember.status}
                    onValueChange={(v: any) => handleUpdateMemberStatus(selectedMember.uid, v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleRemoveMember(selectedMember.uid)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Member
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join the Organizing Committee
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select from Approved Applicants</Label>
              <Select 
                value={inviteData.applicationId} 
                onValueChange={(value) => {
                  const app = approvedApplications.find(a => a.uid === value)
                  if (app) {
                    setInviteData({
                      ...inviteData,
                      applicationId: value,
                      fullName: app.fullName,
                      email: app.email,
                      role: app.ocRole,
                      committee: app.committee || 'General'
                    })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an approved applicant" />
                </SelectTrigger>
                <SelectContent>
                  {approvedApplications.map(app => (
                    <SelectItem key={app.uid} value={app.uid}>
                      {app.fullName} - {app.ocRole}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter manually
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={inviteData.fullName}
                onChange={(e) => setInviteData({ ...inviteData, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Input
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  placeholder="e.g., Chair"
                />
              </div>
              <div className="space-y-2">
                <Label>Committee *</Label>
                <Select 
                  value={inviteData.committee} 
                  onValueChange={(value) => setInviteData({ ...inviteData, committee: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select committee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Assembly">General Assembly</SelectItem>
                    <SelectItem value="Security Council">Security Council</SelectItem>
                    <SelectItem value="Economic and Social">Economic and Social</SelectItem>
                    <SelectItem value="Human Rights">Human Rights</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Press Corps">Press Corps</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sendEmail" 
                checked={inviteData.sendEmail}
                onCheckedChange={(checked) => 
                  setInviteData({ ...inviteData, sendEmail: checked as boolean })
                }
              />
              <Label htmlFor="sendEmail" className="text-sm">
                Send invitation email
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={!inviteData.fullName || !inviteData.email || !inviteData.role || !inviteData.committee}>
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Note Type</Label>
              <Select value={noteType} onValueChange={(v: any) => setNoteType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Interview Slot Dialog */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Interview Slot</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={slotData.start}
                  onChange={(e) => setSlotData({ ...slotData, start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={slotData.end}
                  onChange={(e) => setSlotData({ ...slotData, end: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={slotData.type} 
                onValueChange={(v: 'in_person' | 'video') => setSlotData({ ...slotData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {slotData.type === 'in_person' && (
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={slotData.location || ''}
                  onChange={(e) => setSlotData({ ...slotData, location: e.target.value })}
                  placeholder="Room number, address..."
                />
              </div>
            )}
            
            {slotData.type === 'video' && (
              <div className="space-y-2">
                <Label>Meeting Link</Label>
                <Input
                  value={slotData.meetingLink || ''}
                  onChange={(e) => setSlotData({ ...slotData, meetingLink: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                min="1"
                value={slotData.capacity || 1}
                onChange={(e) => setSlotData({ ...slotData, capacity: parseInt(e.target.value) })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlotDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInterviewSlot}>
              Create Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input
                value={taskData.title || ''}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="Enter task title..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={taskData.description || ''}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={taskData.priority} 
                  onValueChange={(v: any) => setTaskData({ ...taskData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={taskData.dueDate?.split('T')[0] || ''}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select 
                value={taskData.assignedTo?.[0]} 
                onValueChange={(v) => setTaskData({ ...taskData, assignedTo: [v] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {approvedMembers.map(member => (
                    <SelectItem key={member.uid} value={member.uid}>
                      {member.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                value={taskData.tags?.join(', ') || ''}
                onChange={(e) => setTaskData({ 
                  ...taskData, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="design, urgent, meeting..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={!taskData.title}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-lg">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>Task Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedTask.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Created by {selectedTask.createdByName} • {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Badge className={PRIORITY_THEMES[selectedTask.priority]}>
                    {selectedTask.priority}
                  </Badge>
                  <Badge className={STATUS_THEMES[selectedTask.status as keyof typeof STATUS_THEMES]}>
                    {selectedTask.status.replace('_', ' ')}
                  </Badge>
                </div>

                {selectedTask.description && (
                  <div>
                    <Label className="text-xs text-slate-400">Description</Label>
                    <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-slate-400">Assigned To</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTask.assignedTo.map(id => {
                      const member = ocMembers.find(m => m.uid === id)
                      return (
                        <Badge key={id} variant="outline" className="bg-blue-50 text-blue-700">
                          {member?.fullName || id}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Due {new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                  </div>
                  {selectedTask.completedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Completed {new Date(selectedTask.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Calendar Event</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Title *</Label>
              <Input
                value={eventData.title || ''}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                placeholder="Enter event title..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={eventData.description || ''}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                placeholder="Describe the event..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={eventData.type} 
                  onValueChange={(v: any) => setEventData({ ...eventData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>All Day</Label>
                <div className="flex items-center h-10">
                  <Switch
                    checked={eventData.allDay}
                    onCheckedChange={(checked) => setEventData({ ...eventData, allDay: checked })}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date & Time</Label>
                <Input
                  type={eventData.allDay ? "date" : "datetime-local"}
                  value={eventData.startDate || ''}
                  onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <Input
                  type={eventData.allDay ? "date" : "datetime-local"}
                  value={eventData.endDate || ''}
                  onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Location / Link</Label>
              <Input
                value={eventData.location || eventData.onlineLink || ''}
                onChange={(e) => setEventData({ 
                  ...eventData, 
                  location: e.target.value,
                  onlineLink: e.target.value.startsWith('http') ? e.target.value : undefined
                })}
                placeholder="Room number or meeting link..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Invite Members</Label>
              <Select 
                value={eventData.attendees?.[0]} 
                onValueChange={(v) => setEventData({ ...eventData, attendees: [v] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select members" />
                </SelectTrigger>
                <SelectContent>
                  {approvedMembers.map(member => (
                    <SelectItem key={member.uid} value={member.uid}>
                      {member.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={!eventData.title || !eventData.startDate || !eventData.endDate}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>Event Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Created by {selectedEvent.createdByName} • {new Date(selectedEvent.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Badge className={EVENT_COLORS[selectedEvent.type]}>
                  {selectedEvent.type}
                </Badge>

                {selectedEvent.description && (
                  <div>
                    <Label className="text-xs text-slate-400">Description</Label>
                    <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">
                      {new Date(selectedEvent.startDate).toLocaleString()} - {new Date(selectedEvent.endDate).toLocaleString()}
                    </span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  {selectedEvent.onlineLink && (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-slate-400" />
                      <a href={selectedEvent.onlineLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-slate-400">Attendees ({selectedEvent.attendees.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEvent.attendees.map(id => {
                      const member = ocMembers.find(m => m.uid === id)
                      return (
                        <Badge key={id} variant="outline" className="bg-blue-50 text-blue-700">
                          {member?.fullName || id}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>File</Label>
              <Input
                type="file"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={eventData.type} 
                onValueChange={(v: any) => setEventData({ ...eventData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guideline">Guideline</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={!documentFile}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              {selectedApps.length} applications selected
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <RadioGroup defaultValue="status">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="status" id="status" />
                  <Label htmlFor="status">Update Status</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invite" id="invite" />
                  <Label htmlFor="invite">Send Invitations (Approved only)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={bulkStatus} onValueChange={(v: any) => setBulkStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="interview_phase">Interview Phase</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {bulkStatus === 'approved' && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-600">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Applications will be approved. You can send invitations from the Members tab.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusChange}>
              Update {selectedApps.length} Applications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messaging Dialog */}
      {selectedApplication && user && (
        <MessagingDialog
          open={showMessagingDialog}
          onOpenChange={setShowMessagingDialog}
          applicationUid={selectedApplication.uid}
          candidateName={selectedApplication.fullName}
          currentUserName={user.displayName || 'Admin'}
          currentUserId={user.uid}
        />
      )}
    </div>
  )
}