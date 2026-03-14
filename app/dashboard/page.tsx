'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CandidateForm } from '@/components/candidate-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LogOut, Zap, Clock, ShieldCheck, FileText, 
  LayoutDashboard, Globe, Calendar, Loader2, 
  ExternalLink, RefreshCw, CheckCircle2 
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ref, get, update } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --- Interfaces ---
interface InterviewDetails {
  status?: 'pending' | 'scheduled' | 'cancelled'
  phaseStartedAt?: string
  slotStart?: string
  slotEnd?: string
  timeZone?: string
  calBookingId?: string
  calBookingUrl?: string
  bookedAt?: string
}

interface Application {
  fullName: string
  email: string
  school: string
  committee?: string
  ocRole?: string
  motivation: string
  submittedAt: string
  status: 'pending' | 'under_review' | 'interview_phase' | 'approved' | 'rejected'
  aiScore?: number
  adminNotes?: string
  interview?: InterviewDetails
}

interface InterviewSlot {
  start: string
  end: string
  bookingUrl?: string
}

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

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
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

  // --- Logic Functions ---

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

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchApplication()
  }, [user])

  useEffect(() => {
    if (isInterviewPhase && !interviewScheduled) {
      fetchInterviewSlots()
      setIsModalOpen(true)
    } else {
      setIsModalOpen(false)
    }
  }, [isInterviewPhase, interviewScheduled])

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

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-[0.2em] text-slate-900 leading-none">OASIS</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Candidate Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{user.displayName}</p>
              <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
            </div>
            <Avatar className="h-8 w-8 border border-slate-100">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-slate-50 text-blue-600 text-[10px] font-bold">
                {user.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => logout().then(() => router.push('/login'))} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col gap-10">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-50 pb-8">
            <div>
              <h2 className="text-3xl font-light text-slate-900 tracking-tight">System <span className="font-semibold text-blue-600">Overview</span></h2>
              <p className="text-sm text-slate-400 mt-1 font-medium italic">Organizing Committee Recruitment Phase I</p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
              Reference ID: <span className="text-blue-600 font-mono">{user.uid.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-slate-100 shadow-sm"><CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span><ShieldCheck className="w-3.5 h-3.5 text-blue-600" /></div>
              <Badge variant="outline" className={`capitalize font-bold text-[10px] tracking-tight px-2.5 py-0.5 border shadow-none ${getStatusStyles(application?.status || 'none')}`}>
                {application?.status.replace('_', ' ') || 'Not Started'}
              </Badge>
            </CardContent></Card>
            <Card className="border-slate-100 shadow-sm"><CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Index</span><Zap className="w-3.5 h-3.5 text-amber-500" /></div>
              <p className="text-2xl font-bold text-slate-900 tracking-tighter">{application?.aiScore ? `${application.aiScore}%` : '--'}</p>
            </CardContent></Card>
            <Card className="border-slate-100 shadow-sm"><CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission</span><Clock className="w-3.5 h-3.5 text-indigo-500" /></div>
              <p className="text-2xl font-bold text-slate-900 tracking-tighter">{application?.submittedAt ? new Date(application.submittedAt).toLocaleDateString('en-GB') : 'Pending'}</p>
            </CardContent></Card>
            <Card className="border-slate-100 shadow-sm"><CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cycle</span><LayoutDashboard className="w-3.5 h-3.5 text-blue-600" /></div>
              <p className="text-2xl font-bold text-slate-900 tracking-tighter uppercase text-sm">KIMUN 2026</p>
            </CardContent></Card>
          </div>

          {!application || editing ? (
            <div className="max-w-3xl mx-auto py-10">
              <CandidateForm initialValues={editing ? application ?? undefined : undefined} onSuccess={async () => { await fetchApplication(); setEditing(false); }} />
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
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Full Name</label><p className="text-sm font-semibold text-slate-900 uppercase">{application.fullName}</p></div>
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Email Address</label><p className="text-sm font-semibold text-slate-900">{application.email}</p></div>
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Institution</label><p className="text-sm font-semibold text-slate-900">{application.school}</p></div>
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Department</label><p className="text-sm font-bold text-blue-600 uppercase italic">{application.committee ?? application.ocRole ?? '—'}</p></div>
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Motivation</label>
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed italic border-l-2 border-blue-100 pl-4">"{application.motivation}"</p>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
                  <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-blue-400">Institutional Review</h4>
                  <div className="h-1.5 w-full bg-white/10 rounded-full mb-3">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Process: {progressPercent}% Complete</span>
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
                        {new Date(application.interview!.slotStart!).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    {application.interview?.calBookingUrl && (
                      <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 text-xs">
                        <a href={application.interview.calBookingUrl} target="_blank">View Details <ExternalLink className="ml-2 w-3 h-3" /></a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- Interview Scheduling Popup --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px] border-violet-100 rounded-3xl shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-100 rounded-xl"><Calendar className="w-5 h-5 text-violet-600" /></div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 uppercase">Schedule Interview</DialogTitle>
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
                          {new Date(slot.start).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-sm font-bold text-violet-700">
                          {new Date(slot.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
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
              <Button variant="ghost" onClick={fetchInterviewSlots} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <RefreshCw className="w-3 h-3 mr-2" /> Refresh Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}