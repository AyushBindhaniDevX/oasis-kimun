'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CandidateForm } from '@/components/candidate-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Link2, Lock, Unlock, Wifi, WifiOff,
  AtSign, UserCog, UserMinus, UserPlus as UserPlusIcon,
  Shield as ShieldIcon, ShieldAlert, ShieldCheck as ShieldCheckIcon
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ref, get, update, push, set, remove, onValue } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, isToday, isFuture, isPast, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

// --- Enums & Types (keeping all existing interfaces) ---
type MemberRole = 'member' | 'lead' | 'vice_chair' | 'chair' | 'director' | 'secretary' | 'treasurer' | 'advisor'
type MemberStatus = 'active' | 'inactive' | 'on_leave' | 'pending' | 'suspended'
type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled' | 'declined'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'cancelled'
type EventType = 'meeting' | 'deadline' | 'training' | 'social' | 'workshop' | 'conference' | 'interview' | 'review'
type DocumentCategory = 'guideline' | 'template' | 'report' | 'minutes' | 'resource' | 'policy' | 'financial' | 'other'

// --- Interfaces (keeping all existing interfaces) ---
interface InterviewDetails {
  status?: 'pending' | 'scheduled' | 'cancelled' | 'completed' | 'rescheduled'
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
  interviewers?: string[]
  meetingLink?: string
  location?: string
  notes?: string
}

interface InterviewFeedback {
  rating: number
  strengths: string[]
  weaknesses: string[]
  notes: string
  interviewer: string
  submittedAt: string
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
  technicalScore?: number
  communicationScore?: number
  teamworkScore?: number
}

interface Application {
  uid: string
  fullName: string
  email: string
  phone?: string
  school: string
  major?: string
  graduationYear?: string
  committee?: string
  ocRole?: string
  previousExperience?: string
  skills?: string[]
  languages?: string[]
  availability?: {
    weekdays: string[]
    weekend: boolean
    hoursPerWeek: number
    preferredTimes?: string[]
  }
  motivation: string
  submittedAt: string
  status: 'pending' | 'under_review' | 'interview_phase' | 'approved' | 'rejected' | 'waitlisted'
  aiScore?: number
  adminNotes?: string
  notes?: AdminNote[]
  photoURL?: string
  interview?: InterviewDetails
  documents?: {
    cv?: string
    portfolio?: string
    letter?: string
    additional?: { name: string; url: string }[]
  }
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
    portfolio?: string
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
  type: 'general' | 'important' | 'feedback' | 'warning' | 'achievement'
  attachments?: string[]
}

interface InterviewSlot {
  id: string
  start: string
  end: string
  available: boolean
  bookedBy?: string
  bookedByEmail?: string
  bookedByName?: string
  bookingUrl?: string
  type: 'in_person' | 'video' | 'phone'
  location?: string
  meetingLink?: string
  capacity?: number
  bookedCount?: number
  interviewers?: string[]
  notes?: string
}

interface OCMember {
  uid: string
  fullName: string
  email: string
  role: MemberRole
  committee: string
  avatar?: string
  joinedAt: string
  status: MemberStatus
  permissions: string[]
  tasks?: number
  events?: number
  phone?: string
  bio?: string
  applicationId?: string
  invitedBy?: string
  invitedByName?: string
  invitedAt?: string
  lastActive?: string
  expertise?: string[]
  languages?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  badges?: {
    type: string
    awardedAt: string
    awardedBy: string
  }[]
}

interface Invitation {
  id: string
  email: string
  fullName: string
  role: MemberRole
  committee: string
  invitedBy: string
  invitedByName: string
  invitedAt: string
  expiresAt: string
  status: InvitationStatus
  token: string
  applicationId?: string
  message?: string
  reminderCount?: number
  lastReminderAt?: string
  acceptedAt?: string
  declinedAt?: string
  declinedReason?: string
}

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string[]
  assignedToNames?: string[]
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  createdBy: string
  createdByName: string
  createdAt: string
  completedAt?: string
  completedBy?: string
  attachments?: {
    id: string
    name: string
    url: string
    uploadedAt: string
  }[]
  comments?: Comment[]
  tags?: string[]
  category?: string
  estimatedHours?: number
  actualHours?: number
  dependsOn?: string[]
  progress?: number
  isPrivate?: boolean
  committee?: string
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
  attachments?: string[]
  mentions?: string[]
  reactions?: {
    [key: string]: string[]
  }
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  type: EventType
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
  attachments?: string[]
  mandatory: boolean
  committee?: string
}

interface Document {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'xls' | 'ppt' | 'image' | 'txt' | 'zip' | 'other'
  size: number
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  url: string
  category: DocumentCategory
  tags?: string[]
  version?: number
  accessLevel: 'public' | 'committee' | 'admin' | 'private'
  sharedWith?: string[]
  description?: string
  expiresAt?: string
  isArchived?: boolean
}

interface Statistics {
  totalApplications: number
  pendingReview: number
  interviewPhase: number
  approved: number
  rejected: number
  waitlisted: number
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
    onLeave: number
    byCommittee: Record<string, number>
    byRole: Record<string, number>
    newThisMonth: number
    taskCompletion: number
    eventAttendance: number
  }
  taskStats: {
    total: number
    completed: number
    inProgress: number
    overdue: number
    byPriority: Record<string, number>
  }
  eventStats: {
    total: number
    upcoming: number
    past: number
    attendance: Record<string, number>
  }
}

interface Activity {
  id: string
  type: 'status_change' | 'interview_scheduled' | 'note_added' | 'document_uploaded' | 'ai_evaluated' | 'member_invited' | 'member_joined' | 'member_left' | 'task_created' | 'task_completed' | 'event_created' | 'comment_added'
  userId: string
  userName: string
  targetId?: string
  targetName?: string
  targetType?: 'application' | 'member' | 'task' | 'event' | 'document'
  details: string
  timestamp: string
  metadata?: Record<string, any>
}

interface Notification {
  id: string
  userId: string
  type: 'invitation' | 'task' | 'event' | 'mention' | 'deadline' | 'reminder' | 'update'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
  expiresAt?: string
  priority: 'low' | 'medium' | 'high'
}

interface TeamChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  text: string
  createdAt: string
}

// --- Constants ---
const STATUS_THEMES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  interview_phase: 'bg-violet-50 text-violet-700 border-violet-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  waitlisted: 'bg-slate-50 text-slate-600 border-slate-200',
}

const MEMBER_STATUS_THEMES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-50 text-slate-400 border-slate-200',
  on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200',
}

const INVITATION_STATUS_THEMES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-slate-50 text-slate-400 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  declined: 'bg-rose-50 text-rose-700 border-rose-200',
}

const PRIORITY_THEMES = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600',
  urgent: 'bg-rose-100 text-rose-600',
  critical: 'bg-purple-100 text-purple-600',
}

const TASK_STATUS_THEMES = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-600',
  review: 'bg-violet-100 text-violet-600',
  completed: 'bg-emerald-100 text-emerald-600',
  blocked: 'bg-rose-100 text-rose-600',
  cancelled: 'bg-slate-100 text-slate-400',
}

const EVENT_COLORS = {
  meeting: 'bg-blue-100 text-blue-600 border-blue-200',
  deadline: 'bg-amber-100 text-amber-600 border-amber-200',
  training: 'bg-violet-100 text-violet-600 border-violet-200',
  social: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  workshop: 'bg-purple-100 text-purple-600 border-purple-200',
  conference: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  interview: 'bg-pink-100 text-pink-600 border-pink-200',
  review: 'bg-orange-100 text-orange-600 border-orange-200',
}

const ROLE_HIERARCHY: Record<MemberRole, number> = {
  member: 1,
  lead: 2,
  vice_chair: 3,
  chair: 4,
  secretary: 3,
  treasurer: 3,
  director: 4,
  advisor: 5,
}

const COMMITTEES = [
  'General Assembly',
  'Security Council',
  'Economic and Social',
  'Human Rights',
  'Legal',
  'Press Corps',
  'Logistics',
  'IT',
  'Design',
  'Finance',
  'Secretariat',
  'Events',
  'Sponsorship',
  'Academic',
]

const ROLES: MemberRole[] = [
  'member',
  'lead',
  'vice_chair',
  'chair',
  'secretary',
  'treasurer',
  'director',
  'advisor',
]

// Navigation items for bottom bar
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  
  // States
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  
  // Interview/Booking States
  const [interviewSlots, setInterviewSlots] = useState<InterviewSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // OC Portal States
  const [activeNav, setActiveNav] = useState('home')
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [members, setMembers] = useState<OCMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>([])
  const [teamChatInput, setTeamChatInput] = useState('')
  const [sendingTeamChat, setSendingTeamChat] = useState(false)
  
  // UI States
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)
  const [showMemberProfile, setShowMemberProfile] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showInvitationDetails, setShowInvitationDetails] = useState(false)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showDocumentDetails, setShowDocumentDetails] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<OCMember | null>(null)
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCommittee, setFilterCommittee] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [inviteData, setInviteData] = useState({
    email: '',
    fullName: '',
    role: 'member' as MemberRole,
    committee: '',
    message: '',
    applicationId: '',
  })
  const [taskData, setTaskData] = useState<Partial<Task>>({
    priority: 'medium',
    status: 'todo',
  })
  const [eventData, setEventData] = useState<Partial<CalendarEvent>>({
    type: 'meeting',
    allDay: false,
    mandatory: false,
  })
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [statistics, setStatistics] = useState<Statistics>({
    totalApplications: 0,
    pendingReview: 0,
    interviewPhase: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
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
      onLeave: 0,
      byCommittee: {},
      byRole: {},
      newThisMonth: 0,
      taskCompletion: 0,
      eventAttendance: 0,
    },
    taskStats: {
      total: 0,
      completed: 0,
      inProgress: 0,
      overdue: 0,
      byPriority: {},
    },
    eventStats: {
      total: 0,
      upcoming: 0,
      past: 0,
      attendance: {},
    },
  })

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const isApproved = application?.status === 'approved'
  const isInterviewPhase = application?.status === 'interview_phase'
  const interviewScheduled = Boolean(application?.interview?.status === 'scheduled' && application?.interview?.slotStart)

  const currentStep = (() => {
    if (!application?.submittedAt) return 0
    switch (application.status) {
      case 'pending': return 1
      case 'under_review': return 1
      case 'interview_phase': return 2
      case 'approved': return 3
      case 'rejected': return 3
      default: return 1
    }
  })()

  const progressPercent = Math.round((currentStep / 3) * 100)

  // --- Data Fetching ---
  const fetchApplication = async () => {
    if (!user) return
    try {
      const db = getDatabase()
      const appRef = ref(db, `applications/${user.uid}`)
      const snapshot = await get(appRef)
      if (snapshot.exists()) {
        setApplication(snapshot.val())
      } else {
        setApplication(null)
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOCData = async () => {
    if (!user || !isApproved) return
    try {
      const db = getDatabase()

      // Fetch members
      const membersRef = ref(db, 'oc/members')
      const membersSnapshot = await get(membersRef)
      let membersData: any = null
      if (membersSnapshot.exists()) {
        membersData = membersSnapshot.val()
        setMembers(Object.values(membersData))
      }

      // Fetch invitations
      const invitesRef = ref(db, 'oc/invitations')
      const invitesSnapshot = await get(invitesRef)
      let invitesData: any = null
      if (invitesSnapshot.exists()) {
        invitesData = invitesSnapshot.val()
        setInvitations(Object.values(invitesData))
      }

      // Fetch tasks
      const tasksRef = ref(db, 'oc/tasks')
      const tasksSnapshot = await get(tasksRef)
      let tasksData: any = null
      if (tasksSnapshot.exists()) {
        tasksData = tasksSnapshot.val()
        setTasks(Object.values(tasksData))
      }

      // Fetch events
      const eventsRef = ref(db, 'oc/events')
      const eventsSnapshot = await get(eventsRef)
      let eventsData: any = null
      if (eventsSnapshot.exists()) {
        eventsData = eventsSnapshot.val()
        setEvents(Object.values(eventsData))
      }

      // Fetch documents
      const docsRef = ref(db, 'oc/documents')
      const docsSnapshot = await get(docsRef)
      let docsData: any = null
      if (docsSnapshot.exists()) {
        docsData = docsSnapshot.val()
        setDocuments(Object.values(docsData))
      }

      // Fetch notifications
      const notifRef = ref(db, `oc/notifications/${user.uid}`)
      const notifSnapshot = await get(notifRef)
      if (notifSnapshot.exists()) {
        const notifData = notifSnapshot.val()
        setNotifications(Object.values(notifData))
      }

      calculateStatistics(membersData, invitesData, tasksData, eventsData, docsData)
    } catch (error) {
      console.error('Error fetching OC data:', error)
      toast.error('Failed to load OC portal data')
    }
  }

  const calculateStatistics = (members: any, invites: any, tasks: any, events: any, docs: any) => {
    const memberArray = members ? Object.values(members) : []
    const inviteArray = invites ? Object.values(invites) : []
    const taskArray = tasks ? Object.values(tasks) : []
    const eventArray = events ? Object.values(events) : []

    const committeeDist: Record<string, number> = {}
    const roleDist: Record<string, number> = {}
    const priorityDist: Record<string, number> = {}
    
    memberArray.forEach((member: any) => {
      committeeDist[member.committee] = (committeeDist[member.committee] || 0) + 1
      roleDist[member.role] = (roleDist[member.role] || 0) + 1
    })

    taskArray.forEach((task: any) => {
      priorityDist[task.priority] = (priorityDist[task.priority] || 0) + 1
    })

    const now = new Date()
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))

    const newMembersThisMonth = memberArray.filter((m: any) => 
      new Date(m.joinedAt) > oneMonthAgo
    ).length

    const overdueTasks = taskArray.filter((t: any) => 
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length

    const upcomingEvents = eventArray.filter((e: any) => 
      new Date(e.startDate) > new Date()
    ).length

    setStatistics(prev => ({
      ...prev,
      teamStats: {
        totalMembers: memberArray.length,
        activeMembers: memberArray.filter((m: any) => m.status === 'active').length,
        pendingInvites: inviteArray.filter((i: any) => i.status === 'pending').length,
        onLeave: memberArray.filter((m: any) => m.status === 'on_leave').length,
        byCommittee: committeeDist,
        byRole: roleDist,
        newThisMonth: newMembersThisMonth,
        taskCompletion: taskArray.length > 0 
          ? (taskArray.filter((t: any) => t.status === 'completed').length / taskArray.length) * 100 
          : 0,
        eventAttendance: 0,
      },
      taskStats: {
        total: taskArray.length,
        completed: taskArray.filter((t: any) => t.status === 'completed').length,
        inProgress: taskArray.filter((t: any) => t.status === 'in_progress').length,
        overdue: overdueTasks,
        byPriority: priorityDist,
      },
      eventStats: {
        total: eventArray.length,
        upcoming: upcomingEvents,
        past: eventArray.filter((e: any) => new Date(e.endDate) < new Date()).length,
        attendance: {},
      },
    }))
  }

  const fetchInterviewSlots = async () => {
    setSlotsLoading(true)
    setSlotsError(null)
    try {
      const response = await fetch(`/api/interview/slots?timeZone=${encodeURIComponent(userTimeZone)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to load slots')
      const slots: InterviewSlot[] = Array.isArray(data?.slots) ? data.slots : []
      setInterviewSlots(slots)
      if (slots.length > 0 && !selectedSlot) setSelectedSlot(slots[0])
    } catch (error) {
      setSlotsError(error instanceof Error ? error.message : 'Unable to load slots')
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleBookInterviewSlot = async () => {
    if (!user || !application || !selectedSlot) return
    setBookingLoading(true)
    try {
      const response = await fetch('/api/interview/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
          name: application.fullName || user.displayName || 'Applicant',
          email: application.email || user.email,
          timeZone: userTimeZone,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Booking failed')

      const db = getDatabase()
      await update(ref(db, `applications/${user.uid}`), {
        interview: {
          status: 'scheduled',
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
          timeZone: userTimeZone,
          calBookingId: data?.booking?.bookingId || '',
          calBookingUrl: data?.booking?.bookingUrl || '',
          bookedAt: new Date().toISOString(),
        },
      })

      toast.success('Interview scheduled successfully')
      setIsModalOpen(false)
      await fetchApplication()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  // --- Invitation Management ---
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
        applicationId: inviteData.applicationId || undefined,
        message: inviteData.message,
        reminderCount: 0,
      }

      await set(newInviteRef, invitation)

      await createNotification({
        userId: user?.uid || '',
        type: 'invitation',
        title: 'Invitation Sent',
        message: `Invitation sent to ${inviteData.fullName}`,
        priority: 'low',
      })

      toast.success('Invitation sent successfully')
      setShowInviteDialog(false)
      setInviteData({
        email: '',
        fullName: '',
        role: 'member',
        committee: '',
        message: '',
        applicationId: '',
      })

      await addActivity('member_invited', `Invited ${inviteData.fullName} as ${inviteData.role}`, invitation.id, inviteData.fullName)

    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error('Failed to send invitation')
    }
  }

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      const db = getDatabase()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      await update(ref(db, `oc/invitations/${invitation.id}`), {
        expiresAt: expiresAt.toISOString(),
        status: 'pending',
        reminderCount: (invitation.reminderCount || 0) + 1,
        lastReminderAt: new Date().toISOString(),
      })

      toast.success('Invitation resent successfully')
    } catch (error) {
      toast.error('Failed to resend invitation')
    }
  }

  const handleCancelInvitation = async (invitation: Invitation) => {
    try {
      const db = getDatabase()
      await update(ref(db, `oc/invitations/${invitation.id}`), {
        status: 'cancelled',
      })

      toast.success('Invitation cancelled')
      setShowInvitationDetails(false)
    } catch (error) {
      toast.error('Failed to cancel invitation')
    }
  }

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      const db = getDatabase()
      
      await update(ref(db, `oc/invitations/${invitation.id}`), {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      })

      const memberRef = ref(db, `oc/members/${invitation.id}`)
      const newMember: OCMember = {
        uid: invitation.id,
        fullName: invitation.fullName,
        email: invitation.email,
        role: invitation.role,
        committee: invitation.committee,
        joinedAt: new Date().toISOString(),
        status: 'active',
        permissions: ['view', 'comment'],
        invitedBy: invitation.invitedBy,
        invitedByName: invitation.invitedByName,
        invitedAt: invitation.invitedAt,
        applicationId: invitation.applicationId,
      }

      await set(memberRef, newMember)

      toast.success('Invitation accepted! Welcome to the team!')
      
      await addActivity('member_joined', `${invitation.fullName} joined the OC`, invitation.id, invitation.fullName)

    } catch (error) {
      toast.error('Failed to accept invitation')
    }
  }

  const handleDeclineInvitation = async (invitation: Invitation, reason?: string) => {
    try {
      const db = getDatabase()
      await update(ref(db, `oc/invitations/${invitation.id}`), {
        status: 'declined',
        declinedAt: new Date().toISOString(),
        declinedReason: reason || 'No reason provided',
      })

      toast.success('Invitation declined')
      setShowInvitationDetails(false)
    } catch (error) {
      toast.error('Failed to decline invitation')
    }
  }

  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    try {
      const db = getDatabase()
      const notifRef = push(ref(db, `oc/notifications/${notification.userId}`))
      await set(notifRef, {
        ...notification,
        id: notifRef.key,
        createdAt: new Date().toISOString(),
        read: false,
      })
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  const handleMarkNotificationRead = async (notificationId: string) => {
    if (!user) return
    try {
      const db = getDatabase()
      await update(ref(db, `oc/notifications/${user.uid}/${notificationId}`), {
        read: true,
      })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllNotificationsRead = async () => {
    if (!user) return
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      if (unreadNotifications.length === 0) return

      const db = getDatabase()
      await Promise.all(
        unreadNotifications.map((notification) =>
          update(ref(db, `oc/notifications/${user.uid}/${notification.id}`), { read: true })
        )
      )

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to update notifications')
    }
  }

  const sendTeamChatMessage = async () => {
    if (!user || !teamChatInput.trim()) return

    setSendingTeamChat(true)
    try {
      const db = getDatabase()
      const chatRef = push(ref(db, 'oc/chats/general/messages'))
      await set(chatRef, {
        senderId: user.uid,
        senderName: user.displayName || application?.fullName || 'Team Member',
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

  const handleUpdateMemberStatus = async (memberId: string, status: MemberStatus) => {
    try {
      const db = getDatabase()
      await update(ref(db, `oc/members/${memberId}`), {
        status,
        lastActive: status === 'active' ? new Date().toISOString() : null,
      })

      setMembers(prev => prev.map(member =>
        member.uid === memberId
          ? {
              ...member,
              status,
              lastActive: status === 'active' ? new Date().toISOString() : member.lastActive,
            }
          : member
      ))

      toast.success('Member status updated')
    } catch (error) {
      toast.error('Failed to update member status')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const db = getDatabase()
      const member = members.find(m => m.uid === memberId)

      await remove(ref(db, `oc/members/${memberId}`))

      const relatedTaskUpdates = tasks
        .filter(task => task.assignedTo.includes(memberId))
        .map((task) => {
          const assignedTo = task.assignedTo.filter(id => id !== memberId)
          const assignedToNames = assignedTo.map(id => members.find(m => m.uid === id)?.fullName || id)
          return update(ref(db, `oc/tasks/${task.id}`), { assignedTo, assignedToNames })
        })

      const relatedEventUpdates = events
        .filter(event => event.attendees.includes(memberId))
        .map((event) => {
          const attendees = event.attendees.filter(id => id !== memberId)
          const attendeeNames = attendees.map(id => members.find(m => m.uid === id)?.fullName || id)
          return update(ref(db, `oc/events/${event.id}`), { attendees, attendeeNames })
        })

      await Promise.all([...relatedTaskUpdates, ...relatedEventUpdates])

      setMembers(prev => prev.filter(m => m.uid !== memberId))
      setTasks(prev => prev.map(task => {
        const assignedTo = task.assignedTo.filter(id => id !== memberId)
        return {
          ...task,
          assignedTo,
          assignedToNames: assignedTo.map(id => members.find(m => m.uid === id)?.fullName || id),
        }
      }))
      setEvents(prev => prev.map(event => {
        const attendees = event.attendees.filter(id => id !== memberId)
        return {
          ...event,
          attendees,
          attendeeNames: attendees.map(id => members.find(m => m.uid === id)?.fullName || id),
        }
      }))

      if (member) {
        await addActivity('member_left', `${member.fullName} was removed from the OC`, member.uid, member.fullName)
      }

      toast.success('Member removed successfully')
    } catch (error) {
      toast.error('Failed to remove member')
    }
  }

  // --- Task Management ---
  const createTask = async () => {
    if (!taskData.title) {
      toast.error('Please enter a task title')
      return
    }

    try {
      const db = getDatabase()
      const taskRef = push(ref(db, 'oc/tasks'))
      const newTask: Task = {
        id: taskRef.key!,
        title: taskData.title,
        description: taskData.description || '',
        assignedTo: taskData.assignedTo || [],
        assignedToNames: (taskData.assignedTo || []).map(id => {
          const member = members.find(m => m.uid === id)
          return member?.fullName || id
        }),
        dueDate: taskData.dueDate || new Date().toISOString(),
        priority: taskData.priority as TaskPriority || 'medium',
        status: taskData.status as TaskStatus || 'todo',
        createdBy: user?.uid || '',
        createdByName: user?.displayName || 'Admin',
        createdAt: new Date().toISOString(),
        tags: taskData.tags || [],
        progress: 0,
      }

      await set(taskRef, newTask)
      setTasks([...tasks, newTask])
      
      newTask.assignedTo.forEach(async (memberId) => {
        await createNotification({
          userId: memberId,
          type: 'task',
          title: 'New Task Assigned',
          message: `You have been assigned to: ${newTask.title}`,
          priority: 'medium',
          link: `/dashboard?task=${newTask.id}`,
        })
      })

      toast.success('Task created successfully')
      setShowNewTaskDialog(false)
      setTaskData({ priority: 'medium', status: 'todo' })

      await addActivity('task_created', `Created task: ${newTask.title}`, newTask.id, newTask.title)

    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const db = getDatabase()
      const updates: any = { status }
      
      if (status === 'completed') {
        updates.completedAt = new Date().toISOString()
        updates.completedBy = user?.uid
        updates.progress = 100
      }

      await update(ref(db, `oc/tasks/${taskId}`), updates)
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t))
      
      toast.success(`Task marked as ${status.replace('_', ' ')}`)

      if (status === 'completed') {
        await addActivity('task_completed', `Completed task: ${tasks.find(t => t.id === taskId)?.title}`, taskId)
      }

    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const addTaskComment = async (taskId: string, content: string, mentions?: string[]) => {
    if (!content.trim()) return

    try {
      const db = getDatabase()
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const commentRef = push(ref(db, `oc/tasks/${taskId}/comments`))
      const comment: Comment = {
        id: commentRef.key!,
        userId: user?.uid || '',
        userName: user?.displayName || 'Unknown',
        content,
        createdAt: new Date().toISOString(),
        mentions,
      }

      await set(commentRef, comment)

      mentions?.forEach(async (userId) => {
        await createNotification({
          userId,
          type: 'mention',
          title: 'You were mentioned',
          message: `${user?.displayName} mentioned you in: ${task.title}`,
          priority: 'medium',
          link: `/dashboard?task=${taskId}`,
        })
      })

      toast.success('Comment added')

    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  // --- Event Management ---
  const createEvent = async () => {
    if (!eventData.title || !eventData.startDate || !eventData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const db = getDatabase()
      const eventRef = push(ref(db, 'oc/events'))
      const newEvent: CalendarEvent = {
        id: eventRef.key!,
        title: eventData.title,
        description: eventData.description || '',
        type: eventData.type as EventType || 'meeting',
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        allDay: eventData.allDay || false,
        location: eventData.location,
        onlineLink: eventData.onlineLink,
        attendees: eventData.attendees || [],
        attendeeNames: (eventData.attendees || []).map(id => {
          const member = members.find(m => m.uid === id)
          return member?.fullName || id
        }),
        createdBy: user?.uid || '',
        createdByName: user?.displayName || 'Admin',
        createdAt: new Date().toISOString(),
        mandatory: eventData.mandatory || false,
      }

      await set(eventRef, newEvent)
      setEvents([...events, newEvent])

      newEvent.attendees.forEach(async (attendeeId) => {
        await createNotification({
          userId: attendeeId,
          type: 'event',
          title: 'New Event Invitation',
          message: `You are invited to: ${newEvent.title}`,
          priority: newEvent.mandatory ? 'high' : 'medium',
          link: `/dashboard?event=${newEvent.id}`,
        })
      })

      toast.success('Event created successfully')
      setShowNewEventDialog(false)
      setEventData({ type: 'meeting', allDay: false, mandatory: false })

      await addActivity('event_created', `Created event: ${newEvent.title}`, newEvent.id, newEvent.title)

    } catch (error) {
      toast.error('Failed to create event')
    }
  }

  const attendEvent = async (eventId: string) => {
    try {
      const db = getDatabase()
      const event = events.find(e => e.id === eventId)
      if (!event) return

      const updatedAttendees = [...(event.attendees || []), user?.uid as string]
      await update(ref(db, `oc/events/${eventId}`), { attendees: updatedAttendees })
      
      setEvents(events.map(e => e.id === eventId ? { ...e, attendees: updatedAttendees } : e))
      toast.success('Attendance confirmed')
    } catch (error) {
      toast.error('Failed to confirm attendance')
    }
  }

  // --- Activity Tracking ---
  const addActivity = async (type: Activity['type'], details: string, targetId?: string, targetName?: string) => {
    try {
      const db = getDatabase()
      const activityRef = push(ref(db, 'oc/activities'))
      const activity: Activity = {
        id: activityRef.key!,
        type,
        userId: user?.uid || '',
        userName: user?.displayName || 'System',
        targetId,
        targetName,
        details,
        timestamp: new Date().toISOString(),
      }
      await set(activityRef, activity)
    } catch (error) {
      console.error('Error adding activity:', error)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchApplication()

    if (isApproved) {
      const db = getDatabase()
      
      const membersRef = ref(db, 'oc/members')
      const unsubscribeMembers = onValue(membersRef, (snapshot) => {
        if (snapshot.exists()) {
          setMembers(Object.values(snapshot.val()))
        }
      })

      const invitesRef = ref(db, 'oc/invitations')
      const unsubscribeInvites = onValue(invitesRef, (snapshot) => {
        if (snapshot.exists()) {
          setInvitations(Object.values(snapshot.val()))
        }
      })

      const tasksRef = ref(db, 'oc/tasks')
      const unsubscribeTasks = onValue(tasksRef, (snapshot) => {
        if (snapshot.exists()) {
          setTasks(Object.values(snapshot.val()))
        }
      })

      const eventsRef = ref(db, 'oc/events')
      const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
        if (snapshot.exists()) {
          setEvents(Object.values(snapshot.val()))
        }
      })

      const docsRef = ref(db, 'oc/documents')
      const unsubscribeDocs = onValue(docsRef, (snapshot) => {
        if (snapshot.exists()) {
          setDocuments(Object.values(snapshot.val()))
        } else {
          setDocuments([])
        }
      })

      const notificationsRef = ref(db, `oc/notifications/${user.uid}`)
      const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data: Notification[] = []
          snapshot.forEach((childSnapshot) => {
            data.push({
              id: childSnapshot.key || '',
              ...childSnapshot.val(),
            })
          })
          setNotifications(data)
        } else {
          setNotifications([])
        }
      })

      const teamChatRef = ref(db, 'oc/chats/general/messages')
      const unsubscribeTeamChat = onValue(teamChatRef, (snapshot) => {
        if (snapshot.exists()) {
          const data: TeamChatMessage[] = []
          snapshot.forEach((childSnapshot) => {
            data.push({
              id: childSnapshot.key || '',
              ...childSnapshot.val(),
            })
          })
          data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          setTeamChatMessages(data)
        } else {
          setTeamChatMessages([])
        }
      })

      return () => {
        unsubscribeMembers()
        unsubscribeInvites()
        unsubscribeTasks()
        unsubscribeEvents()
        unsubscribeDocs()
        unsubscribeNotifications()
        unsubscribeTeamChat()
      }
    }
  }, [user, isApproved])

  useEffect(() => {
    if (isApproved) {
      fetchOCData()
    } else if (isInterviewPhase && !interviewScheduled) {
      fetchInterviewSlots()
      setIsModalOpen(true)
    } else {
      setIsModalOpen(false)
    }
  }, [isInterviewPhase, isApproved, interviewScheduled])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'interview_phase': return 'bg-violet-50 text-violet-700 border-violet-200'
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'under_review': return 'bg-amber-50 text-amber-700 border-amber-200'
      default: return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  // --- Render Home Tab ---
  const renderHome = () => (
    <div className="space-y-4 p-4 pb-24">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome back, {application?.fullName?.split(' ')[0]}! 👋</h2>
              <p className="text-blue-100 text-sm">KIMUN 2026 • {application?.committee || application?.ocRole}</p>
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
              <span className="text-xs text-slate-400">Team</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{statistics.teamStats.activeMembers}</p>
            <p className="text-xs text-slate-400 mt-1">
              {statistics.teamStats.pendingInvites} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Tasks</span>
              <CheckSquare className="w-4 h-4 text-emerald-600" />
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
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold">{statistics.eventStats.upcoming}</p>
            <p className="text-xs text-slate-400 mt-1">
              upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Progress</span>
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-2xl font-bold">{Math.round(statistics.teamStats.taskCompletion)}%</p>
            <p className="text-xs text-slate-400 mt-1">
              completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks
            .filter(t => t.status !== 'completed' && new Date(t.dueDate) > new Date())
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3)
            .map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  task.priority === 'urgent' ? 'bg-rose-500' :
                  task.priority === 'high' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-slate-400">Due {format(new Date(task.dueDate), 'MMM d')}</p>
                </div>
                <Badge className={`text-[9px] ${PRIORITY_THEMES[task.priority]}`}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          {tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) > new Date()).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-2">No upcoming tasks</p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events
            .filter(e => new Date(e.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 3)
            .map(event => (
              <div key={event.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className={`p-2 rounded-lg ${EVENT_COLORS[event.type]}`}>
                  {event.type === 'meeting' && <Users className="w-3 h-3" />}
                  {event.type === 'deadline' && <Clock className="w-3 h-3" />}
                  {event.type === 'training' && <BookOpen className="w-3 h-3" />}
                  {event.type === 'social' && <Coffee className="w-3 h-3" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-slate-400">{format(new Date(event.startDate), 'MMM d, h:mm a')}</p>
                </div>
                {!event.attendees.includes(user?.uid || '') && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-[10px]"
                    onClick={() => attendEvent(event.id)}
                  >
                    Attend
                  </Button>
                )}
              </div>
            ))}
          {events.filter(e => new Date(e.startDate) > new Date()).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-2">No upcoming events</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {statistics.recentActivity.slice(0, 3).map(activity => (
            <div key={activity.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <div className={`p-1.5 rounded-lg ${
                activity.type === 'member_joined' ? 'bg-emerald-100 text-emerald-600' :
                activity.type === 'task_completed' ? 'bg-green-100 text-green-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {activity.type === 'member_joined' && <UserPlus className="w-3 h-3" />}
                {activity.type === 'task_completed' && <CheckCircle className="w-3 h-3" />}
                {activity.type === 'task_created' && <Target className="w-3 h-3" />}
              </div>
              <div className="flex-1">
                <p className="text-xs">{activity.details}</p>
                <p className="text-[9px] text-slate-400">
                  {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  // --- Render Tasks Tab ---
  const renderTasks = () => (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">My Tasks</h2>
        <Button size="sm" onClick={() => setShowNewTaskDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.assignedTo.includes(user?.uid || '')).length}</p>
            <p className="text-[9px] text-slate-400">Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {tasks.filter(t => t.assignedTo.includes(user?.uid || '') && t.status === 'completed').length}
            </p>
            <p className="text-[9px] text-slate-400">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-rose-600">
              {tasks.filter(t => t.assignedTo.includes(user?.uid || '') && t.status !== 'completed' && new Date(t.dueDate) < new Date()).length}
            </p>
            <p className="text-[9px] text-slate-400">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks
          .filter(t => t.assignedTo.includes(user?.uid || ''))
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
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
                    <span className={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-rose-600 font-medium' : ''}>
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  </div>
                  <Badge className={`text-[9px] ${TASK_STATUS_THEMES[task.status]}`}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>

                {task.progress !== undefined && task.status !== 'completed' && (
                  <Progress value={task.progress} className="h-1 mt-3" />
                )}
              </CardContent>
            </Card>
          ))}

        {tasks.filter(t => t.assignedTo.includes(user?.uid || '')).length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No tasks assigned yet</p>
          </div>
        )}
      </div>
    </div>
  )

  // --- Render Calendar Tab ---
  const renderCalendar = () => {
    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="space-y-4 p-4 pb-24">
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
          <Button size="sm" onClick={() => setShowNewEventDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <div key={`${day}-${index}`} className="text-center text-xs font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((date, i) => {
                const dayEvents = events.filter(e => 
                  format(new Date(e.startDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                )
                const isTodayFlag = isToday(date)
                
                return (
                  <div
                    key={i}
                    className={`min-h-[80px] p-1 border border-slate-100 rounded-lg ${
                      isTodayFlag ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className={`text-xs font-medium ${
                      isTodayFlag ? 'text-blue-600' : 'text-slate-900'
                    }`}>
                      {format(date, 'd')}
                    </span>
                    
                    <div className="space-y-0.5 mt-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-[6px] p-0.5 rounded truncate ${EVENT_COLORS[event.type]}`}
                        >
                          • {event.title.substring(0, 8)}
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
                <div 
                  key={event.id} 
                  className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event)
                    setShowEventDetails(true)
                  }}
                >
                  <div className={`p-2 rounded-lg ${EVENT_COLORS[event.type]}`}>
                    {event.type === 'meeting' && <Users className="w-4 h-4" />}
                    {event.type === 'deadline' && <Clock className="w-4 h-4" />}
                    {event.type === 'training' && <BookOpen className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(event.startDate), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  {event.mandatory && (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Render Team Tab ---
  const renderTeam = () => {
    const pendingInvites = invitations.filter(i => i.status === 'pending')
    const activeMembers = members.filter(m => m.status === 'active' || m.status === 'on_leave')

    return (
      <div className="space-y-4 p-4 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Team</h2>
            <p className="text-xs text-slate-400">
              {activeMembers.length} members • {pendingInvites.length} pending
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
          {activeMembers
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
                  setShowMemberProfile(true)
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
                          <p className="text-xs text-slate-400 capitalize">{member.role.replace('_', ' ')}</p>
                        </div>
                        <Badge variant="outline" className={MEMBER_STATUS_THEMES[member.status]}>
                          {member.status === 'on_leave' ? 'On Leave' : member.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[9px]">
                          {member.committee}
                        </Badge>
                        <span className="text-[9px] text-slate-400">
                          {tasks.filter(t => t.assignedTo.includes(member.uid)).length} tasks
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
                          Expires {format(new Date(invite.expiresAt), 'MMM d')}
                        </p>
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
  }

  // --- Render Chat Tab ---
  const renderChat = () => (
    <div className="flex flex-col h-[calc(100vh-120px)] p-4 pb-24">
      <h2 className="text-lg font-bold mb-4">Team Chat</h2>
      
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-4 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-280px)] pr-4">
            <div className="space-y-4">
              {teamChatMessages.map((message) => {
                const isMe = message.senderId === user?.uid
                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                      isMe ? 'bg-blue-600 text-white' : 'bg-slate-100'
                    }`}>
                      {!isMe && (
                        <p className="text-[10px] font-semibold mb-1 text-slate-500">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-[8px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
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

  // --- Render Profile Tab ---
  const renderProfile = () => (
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
            {application?.committee || application?.ocRole || 'OC Member'}
          </Badge>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.assignedTo.includes(user?.uid || '')).length}</p>
            <p className="text-xs text-slate-400">Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{events.filter(e => e.attendees.includes(user?.uid || '')).length}</p>
            <p className="text-xs text-slate-400">Events</p>
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
            <span className="text-sm text-slate-400">Member since</span>
            <span className="text-sm">
              {members.find(m => m.uid === user?.uid)?.joinedAt 
                ? format(new Date(members.find(m => m.uid === user?.uid)!.joinedAt), 'MMM d, yyyy')
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-slate-400">Role</span>
            <span className="text-sm capitalize">
              {members.find(m => m.uid === user?.uid)?.role?.replace('_', ' ') || 'Member'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-slate-400">Committee</span>
            <span className="text-sm">
              {members.find(m => m.uid === user?.uid)?.committee || application?.committee || 'General'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          {notifications.filter(n => !n.read).length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleMarkAllNotificationsRead}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No notifications</p>
          ) : (
            notifications
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer ${!notification.read ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkNotificationRead(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      notification.type === 'task' ? 'bg-amber-100 text-amber-600' :
                      notification.type === 'event' ? 'bg-violet-100 text-violet-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {notification.type === 'task' && <Target className="w-3 h-3" />}
                      {notification.type === 'event' && <Calendar className="w-3 h-3" />}
                      {notification.type === 'mention' && <AtSign className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{notification.title}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{notification.message}</p>
                      <p className="text-[8px] text-slate-400 mt-1">
                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </div>
              ))
          )}
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

  return (
    <div className={`min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-700 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-[0.2em] text-slate-900 leading-none">
                {isApproved ? 'OC PORTAL' : 'OASIS'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {isApproved ? 'Organizing Committee' : 'Candidate Portal'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{user.displayName}</p>
              <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
            </div>
            <Avatar className="h-8 w-8 border border-slate-100 cursor-pointer" onClick={() => isApproved ? setActiveNav('profile') : null}>
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-slate-50 text-blue-600 text-[10px] font-bold">
                {user.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logout().then(() => router.push('/login'))} 
              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {isApproved ? (
          // OC Portal View
          <>
            {activeNav === 'home' && renderHome()}
            {activeNav === 'tasks' && renderTasks()}
            {activeNav === 'calendar' && renderCalendar()}
            {activeNav === 'team' && renderTeam()}
            {activeNav === 'chat' && renderChat()}
            {activeNav === 'profile' && renderProfile()}
          </>
        ) : (
          // Candidate Portal View
          <div className="flex flex-col gap-10 px-6 py-12">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-50 pb-8">
              <div>
                <h2 className="text-3xl font-light text-slate-900 tracking-tight">
                  System <span className="font-semibold text-blue-600">Overview</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1 font-medium italic">
                  Organizing Committee Recruitment Phase I
                </p>
              </div>
              <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
                Reference ID: <span className="text-blue-600 font-mono">{user.uid.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <Badge variant="outline" className={`capitalize font-bold text-[10px] tracking-tight px-2.5 py-0.5 border shadow-none ${getStatusStyles(application?.status || 'none')}`}>
                    {application?.status.replace('_', ' ') || 'Not Started'}
                  </Badge>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Index</span>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tighter">
                    {application?.aiScore ? `${application.aiScore}%` : '--'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission</span>
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tighter">
                    {application?.submittedAt ? new Date(application.submittedAt).toLocaleDateString('en-GB') : 'Pending'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cycle</span>
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tighter uppercase text-sm">KIMUN 2026</p>
                </CardContent>
              </Card>
            </div>

            {!application || editing ? (
              <div className="max-w-3xl mx-auto py-10">
                <CandidateForm 
                  initialValues={editing ? application ?? undefined : undefined} 
                  onSuccess={async () => { 
                    await fetchApplication(); 
                    setEditing(false); 
                  }} 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Application Details */}
                <Card className="lg:col-span-2 border-slate-100 shadow-sm">
                  <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-4">
                    <CardTitle className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">
                      <FileText className="w-4 h-4 text-blue-600" /> Application Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                        <p className="text-sm font-semibold text-slate-900 uppercase">{application.fullName}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
                        <p className="text-sm font-semibold text-slate-900">{application.email}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Institution</label>
                        <p className="text-sm font-semibold text-slate-900">{application.school}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Department</label>
                        <p className="text-sm font-bold text-blue-600 uppercase italic">
                          {application.committee ?? application.ocRole ?? '—'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Motivation</label>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed italic border-l-2 border-blue-100 pl-4">
                        "{application.motivation}"
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
                    <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-blue-400">Institutional Review</h4>
                    <div className="h-1.5 w-full bg-white/10 rounded-full mb-3">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }} 
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      Process: {progressPercent}% Complete
                    </span>
                  </div>

                  {/* Interview Confirmation Card (Visible when scheduled) */}
                  {interviewScheduled && (
                    <div className="p-6 rounded-3xl border border-emerald-100 bg-emerald-50/30">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <h5 className="text-[10px] font-bold text-emerald-800 uppercase tracking-[0.2em]">Interview Confirmed</h5>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-emerald-100 mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date & Time</p>
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(application.interview!.slotStart!).toLocaleString('en-GB', { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </p>
                      </div>
                      {application.interview?.calBookingUrl && (
                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 text-xs">
                          <a href={application.interview.calBookingUrl} target="_blank">
                            View Details <ExternalLink className="ml-2 w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation (OC Portal only) */}
      {isApproved && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.id
              let badgeCount = 0
              
              if (item.id === 'tasks') badgeCount = tasks.filter(t => t.assignedTo.includes(user?.uid || '') && t.status !== 'completed' && new Date(t.dueDate) < new Date()).length
              if (item.id === 'team') badgeCount = invitations.filter(i => i.status === 'pending').length
              if (item.id === 'calendar') badgeCount = events.filter(e => new Date(e.startDate) > new Date()).length

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
      )}

      {/* Interview Scheduling Popup (Only for non-approved candidates) */}
      {!isApproved && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[450px] border-violet-100 rounded-3xl shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-violet-600" />
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  Schedule Interview
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 italic">
                Phase II: Personal Evaluation. Slots shown in {userTimeZone}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {slotsLoading ? (
                  <div className="flex flex-col items-center py-12 gap-3 text-violet-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Syncing Slots...</span>
                  </div>
                ) : interviewSlots.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-medium">No slots found. Please check back later.</p>
                  </div>
                ) : (
                  interviewSlots.map((slot) => {
                    const isSelected = selectedSlot?.start === slot.start
                    return (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                          isSelected 
                            ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500' 
                            : 'border-slate-100 bg-white hover:border-violet-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {new Date(slot.start).toLocaleDateString('en-GB', { 
                              weekday: 'short', 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </span>
                          <span className="text-sm font-bold text-violet-700">
                            {new Date(slot.start).toLocaleTimeString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(slot.end).toLocaleTimeString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                      </button>
                    )
                  })
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-slate-50">
                <Button 
                  onClick={handleBookInterviewSlot}
                  disabled={!selectedSlot || bookingLoading}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-100"
                >
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Selection'}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={fetchInterviewSlots} 
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  <RefreshCw className="w-3 h-3 mr-2" /> Refresh Availability
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogs - Keeping all existing dialogs */}
      {/* Member Profile Dialog */}
      <Dialog open={showMemberProfile} onOpenChange={setShowMemberProfile}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Member Profile</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-blue-100">
                    <AvatarImage src={selectedMember.avatar} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 text-3xl">
                      {selectedMember.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedMember.fullName}</h3>
                    <p className="text-sm text-slate-400 capitalize">{selectedMember.role.replace('_', ' ')}</p>
                    <p className="text-sm text-slate-400 mt-1">{selectedMember.email}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {selectedMember.committee}
                      </Badge>
                      <Badge variant="outline" className={MEMBER_STATUS_THEMES[selectedMember.status]}>
                        {selectedMember.status === 'on_leave' ? 'On Leave' : selectedMember.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">
                      {tasks.filter(t => t.assignedTo.includes(selectedMember.uid)).length}
                    </p>
                    <p className="text-xs text-slate-400">Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">
                      {tasks.filter(t => t.assignedTo.includes(selectedMember.uid) && t.status === 'completed').length}
                    </p>
                    <p className="text-xs text-slate-400">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-violet-600">
                      {events.filter(e => e.attendees.includes(selectedMember.uid)).length}
                    </p>
                    <p className="text-xs text-slate-400">Events</p>
                  </div>
                </div>

                {selectedMember.bio && (
                  <div>
                    <h4 className="text-sm font-bold mb-2">Bio</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {selectedMember.bio}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold mb-3">Assigned Tasks</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {tasks
                      .filter(t => t.assignedTo.includes(selectedMember.uid))
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-slate-400">Due {format(new Date(task.dueDate), 'MMM d')}</p>
                          </div>
                          <Badge className={TASK_STATUS_THEMES[task.status]}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>Task Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedTask.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Created by {selectedTask.createdByName} • {format(new Date(selectedTask.createdAt), 'MMM d')}
                    </p>
                  </div>
                  <Badge className={TASK_STATUS_THEMES[selectedTask.status]}>
                    {selectedTask.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-400">Priority</Label>
                    <Badge className={PRIORITY_THEMES[selectedTask.priority]}>
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Due Date</Label>
                    <p className="font-medium">{format(new Date(selectedTask.dueDate), 'MMM d, yyyy')}</p>
                  </div>
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
                      const member = members.find(m => m.uid === id)
                      return (
                        <Badge key={id} variant="outline" className="bg-blue-50 text-blue-700">
                          {member?.fullName || id}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {selectedTask.progress !== undefined && selectedTask.status !== 'completed' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <Label className="text-xs text-slate-400">Progress</Label>
                      <span className="font-bold">{selectedTask.progress}%</span>
                    </div>
                    <Progress value={selectedTask.progress} className="h-2" />
                  </div>
                )}

                {selectedTask.assignedTo.includes(user?.uid || '') && selectedTask.status !== 'completed' && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => updateTaskStatus(selectedTask.id, 'in_progress')}
                    >
                      Start Progress
                    </Button>
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateTaskStatus(selectedTask.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>Event Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                  <Badge className={EVENT_COLORS[selectedEvent.type]}>
                    {selectedEvent.type}
                  </Badge>
                </div>

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
                      {format(new Date(selectedEvent.startDate), 'MMM d, yyyy h:mm a')} - {format(new Date(selectedEvent.endDate), 'h:mm a')}
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
                      const member = members.find(m => m.uid === id)
                      return (
                        <Badge key={id} variant="outline" className="bg-blue-50 text-blue-700">
                          {member?.fullName || id}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {!selectedEvent.attendees.includes(user?.uid || '') && (
                  <Button 
                    className="w-full mt-4"
                    onClick={() => {
                      attendEvent(selectedEvent.id)
                      setShowEventDetails(false)
                    }}
                  >
                    Confirm Attendance
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a task for yourself or your team</DialogDescription>
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
                  onValueChange={(v: TaskPriority) => setTaskData({ ...taskData, priority: v })}
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
                  {members
                    .filter(m => m.status === 'active')
                    .map(member => (
                      <SelectItem key={member.uid} value={member.uid}>
                        {member.fullName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createTask} className="bg-blue-600 hover:bg-blue-700">
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Event Dialog */}
      <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Schedule a meeting, deadline, or social event</DialogDescription>
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
                  onValueChange={(v: EventType) => setEventData({ ...eventData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createEvent} className="bg-blue-600 hover:bg-blue-700">
              Create Event
            </Button>
          </DialogFooter>
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
              <Label>Email *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={inviteData.fullName}
                onChange={(e) => setInviteData({ ...inviteData, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select 
                  value={inviteData.role} 
                  onValueChange={(v: MemberRole) => setInviteData({ ...inviteData, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Committee *</Label>
                <Select 
                  value={inviteData.committee} 
                  onValueChange={(v) => setInviteData({ ...inviteData, committee: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select committee" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMITTEES.map(committee => (
                      <SelectItem key={committee} value={committee}>{committee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember}>
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              confirmAction?.onConfirm()
              setShowConfirmDialog(false)
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}