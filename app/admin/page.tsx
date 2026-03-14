'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  LogOut, Zap, Search, ShieldCheck, FileText, 
  Loader2, User, Download, Calendar, ExternalLink, Clock 
} from 'lucide-react'
import { ref, onValue, update } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { evaluateApplication } from '@/lib/ai-service'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- Interfaces ---
interface InterviewDetails {
  status?: 'pending' | 'scheduled' | 'cancelled'
  slotStart?: string
  slotEnd?: string
  timeZone?: string
  calBookingUrl?: string
  bookedAt?: string
}

interface Application {
  uid: string
  fullName: string
  email: string
  school: string
  ocRole: string
  motivation: string
  submittedAt: string
  status: 'pending' | 'under_review' | 'interview_phase' | 'approved' | 'rejected'
  aiScore?: number
  photoURL?: string
  interview?: InterviewDetails
}

const STATUS_THEMES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  interview_phase: 'bg-violet-50 text-violet-700 border-violet-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [appsLoading, setAppsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null)

  // --- Data Fetching ---
  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    const db = getDatabase()
    const unsubscribe = onValue(ref(db, 'applications'), (snapshot) => {
      const data: Application[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({ uid: child.key as string, ...child.val() })
        })
      }
      setApplications(data)
      setAppsLoading(false)
    }, () => {
      setAppsLoading(false)
      toast.error("Oasis Vault Access Denied")
    })
    return () => unsubscribe()
  }, [user, router, authLoading])

  // --- Filtering ---
  useEffect(() => {
    let filtered = [...applications]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a => a.fullName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter)
    setFilteredApplications(filtered)
  }, [applications, searchQuery, statusFilter])

  // --- Actions ---
  const handleAiEvaluate = async (app: Application) => {
    setEvaluatingId(app.uid)
    try {
      const result = await evaluateApplication(app)
      const db = getDatabase()
      await update(ref(db, `applications/${app.uid}`), { aiScore: result.score, status: 'under_review' })
      toast.success(`Merit Scored: ${result.score}/100`)
    } catch (error) { toast.error("AI Sync Failed") } 
    finally { setEvaluatingId(null) }
  }

  const handleStatusChange = async (uid: string, newStatus: Application['status']) => {
    const db = getDatabase()
    if (newStatus === 'approved') {
      const now = new Date().toISOString()
      await update(ref(db, `applications/${uid}`), {
        status: 'interview_phase',
        approvedAt: now,
        interview: { status: 'pending', phaseStartedAt: now },
      })
      toast.success('Applicant moved to Interview Phase')
      return
    }
    await update(ref(db, `applications/${uid}`), { status: newStatus })
    toast.success("Status Updated")
  }

  const scheduledInterviews = applications
    .filter(app => app.interview?.status === 'scheduled' && app.interview?.slotStart)
    .sort((a, b) => new Date(a.interview!.slotStart!).getTime() - new Date(b.interview!.slotStart!).getTime())

  if (authLoading || appsLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-[0.2em] uppercase leading-none text-slate-900">Oasis Admin</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Digital Secretariat</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logout()} className="text-slate-500 hover:text-rose-600 text-[10px] font-bold uppercase tracking-widest">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        <Tabs defaultValue="applications" className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-slate-100/50 p-1 rounded-xl">
              <TabsTrigger value="applications" className="text-[10px] font-bold uppercase tracking-widest px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="w-3.5 h-3.5 mr-2" /> Vault
              </TabsTrigger>
              <TabsTrigger value="interviews" className="text-[10px] font-bold uppercase tracking-widest px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar className="w-3.5 h-3.5 mr-2" /> Appointments
                {scheduledInterviews.length > 0 && (
                  <Badge className="ml-2 bg-violet-600 text-[9px] h-4 min-w-4 px-1">{scheduledInterviews.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="applications" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Vault', val: applications.length, icon: ShieldCheck, color: 'text-blue-600' },
                { label: 'Pending Review', val: applications.filter(a => a.status === 'pending').length, icon: Clock, color: 'text-amber-500' },
                { label: 'Interviewing', val: applications.filter(a => a.status === 'interview_phase').length, icon: Calendar, color: 'text-violet-600' },
                { label: 'Decided', val: applications.filter(a => a.status === 'approved' || a.status === 'rejected').length, icon: Zap, color: 'text-emerald-600' }
              ].map((stat, i) => (
                <Card key={i} className="border-slate-100 shadow-sm">
                  <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent><p className="text-3xl font-black text-slate-900">{stat.val}</p></CardContent>
                </Card>
              ))}
            </div>

            {/* Application Table */}
            <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
              <div className="p-4 flex gap-4 bg-slate-50/50 border-b border-slate-100">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-300" />
                  <input placeholder="Filter candidate dossiers..." className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-100 rounded-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] h-9 bg-white text-[10px] font-bold uppercase tracking-widest"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Reviewing</SelectItem>
                    <SelectItem value="interview_phase">Interviewing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/30 border-b border-slate-50 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <tr><th className="p-4">Candidate Profile</th><th className="p-4">Merit</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredApplications.map((app) => (
                      <tr key={app.uid} className="hover:bg-slate-50/20 group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-slate-100"><AvatarImage src={app.photoURL} /><AvatarFallback>{app.fullName?.charAt(0)}</AvatarFallback></Avatar>
                            <div className="flex flex-col">
                              <p className="text-sm font-bold text-slate-900 uppercase leading-none">{app.fullName}</p>
                              <p className="text-[10px] text-blue-600 font-semibold mt-1">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {app.aiScore ? (
                            <div className="inline-flex flex-col"><span className="text-sm font-black text-blue-600">{app.aiScore}%</span><div className="w-12 h-1 bg-slate-100 rounded-full mt-1"><div className="h-full bg-blue-500" style={{ width: `${app.aiScore}%` }} /></div></div>
                          ) : (
                            <button onClick={() => handleAiEvaluate(app)} disabled={evaluatingId === app.uid} className="text-slate-300 hover:text-blue-500">{evaluatingId === app.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}</button>
                          )}
                        </td>
                        <td className="p-4">
                          <Select value={app.status} onValueChange={(v) => handleStatusChange(app.uid, v as Application['status'])}>
                            <SelectTrigger className={`h-7 w-[110px] text-[9px] font-black uppercase tracking-widest ${STATUS_THEMES[app.status]}`}><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="under_review">Reviewing</SelectItem><SelectItem value="interview_phase">Interview</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-right">
                          <Dialog>
  <DialogTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-blue-600">
      <User className="w-4 h-4" />
    </Button>
  </DialogTrigger>
  <DialogContent className="rounded-3xl max-w-lg">
    {/* 1. Add DialogHeader and DialogTitle for Accessibility */}
    <DialogHeader className="sr-only">
      <DialogTitle>Candidate Profile: {app.fullName}</DialogTitle>
    </DialogHeader>

    {/* 2. Your existing content follows */}
    <div className="flex items-center gap-4 mb-6">
      <Avatar className="h-16 w-16">
        <AvatarImage src={app.photoURL} />
        <AvatarFallback>{app.fullName[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-xl font-black uppercase">{app.fullName}</h2>
        <p className="text-blue-600 text-sm font-bold">{app.email}</p>
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase">Motivation</label>
        <p className="text-sm italic text-slate-600 mt-1">"{app.motivation}"</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Institution</label>
          <p className="text-sm font-bold uppercase">{app.school}</p>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
          <p className="text-sm font-bold text-blue-600 uppercase">{app.ocRole}</p>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* --- NEW APPOINTMENTS TAB --- */}
          <TabsContent value="interviews" className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduledInterviews.length > 0 ? (
                  scheduledInterviews.map((app) => (
                    <Card key={app.uid} className="border-slate-100 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-3xl overflow-hidden border-l-4 border-l-violet-500">
                      <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-violet-100 text-violet-700 text-[9px] uppercase font-bold border-violet-200">Interview Scheduled</Badge>
                          <span className="text-[9px] font-mono text-slate-400">ID: {app.uid.substring(0,6)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                           <Avatar className="h-10 w-10"><AvatarImage src={app.photoURL}/><AvatarFallback>{app.fullName[0]}</AvatarFallback></Avatar>
                           <div>
                              <CardTitle className="text-sm font-black uppercase tracking-tight">{app.fullName}</CardTitle>
                              <p className="text-[10px] font-bold text-blue-600">{app.ocRole} Candidate</p>
                           </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start gap-3">
                           <div className="p-2 bg-violet-50 rounded-lg"><Calendar className="w-4 h-4 text-violet-600"/></div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Interview Time</p>
                              <p className="text-sm font-bold text-slate-900 mt-0.5">
                                {new Date(app.interview!.slotStart!).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                              </p>
                              <p className="text-xs font-semibold text-violet-600">
                                {new Date(app.interview!.slotStart!).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {new Date(app.interview!.slotEnd!).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                           <Button asChild className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest">
                              <a href={app.interview?.calBookingUrl} target="_blank" rel="noreferrer">
                                Open Cal.com <ExternalLink className="w-3 h-3 ml-2" />
                              </a>
                           </Button>
                           <Button variant="outline" size="icon" onClick={() => downloadPDF(app)} className="h-10 w-10 rounded-xl border-slate-200">
                              <Download className="w-4 h-4 text-slate-400" />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-[3rem]">
                    <Calendar className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-sm font-bold uppercase tracking-widest">No candidates have booked slots yet.</p>
                  </div>
                )}
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}