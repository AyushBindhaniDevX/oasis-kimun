'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CandidateForm } from '@/components/candidate-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Zap, Clock, ShieldCheck, FileText, LayoutDashboard, Globe } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ref, get } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { Badge } from '@/components/ui/badge'

interface Application {
  fullName: string
  email: string
  school: string
  committee?: string
  ocRole?: string
  motivation: string
  submittedAt: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  aiScore?: number
  adminNotes?: string
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  // Determine progress step based on application status
  const currentStep = (() => {
    if (!application) return 0
    if (!application.submittedAt) return 0
    switch (application.status) {
      case 'pending': return 1
      case 'under_review': return 2
      case 'approved': return 3
      case 'rejected': return 3
      default: return 1
    }
  })()

  const progressPercent = Math.round((currentStep / 3) * 100)

  // Fetch the current user's application (callable for reloads)
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

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchApplication()
  }, [user, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!user) return null

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'under_review': return 'bg-amber-50 text-amber-700 border-amber-200'
      default: return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Oasis Minimal Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
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
              <AvatarFallback className="bg-slate-50 text-blue-600 text-[10px] font-bold">{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
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
            <Card className="border-slate-100 shadow-sm bg-white">
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

            <Card className="border-slate-100 shadow-sm bg-white">
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

            <Card className="border-slate-100 shadow-sm bg-white">
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

            <Card className="border-slate-100 shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cycle</span>
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 tracking-tighter uppercase text-sm">Phase I</p>
              </CardContent>
            </Card>
          </div>

          {/* Form or Profile View */}
          <div className="mt-4">
            {!application || editing ? (
              <div className="max-w-3xl mx-auto py-10">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 mb-10 text-center">
                  <Globe className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Oasis Registration</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto italic">Complete your profile to initiate the evaluation process for the KIMUN 2026 Organizing Committee.</p>
                </div>
                <CandidateForm initialValues={editing ? application ?? undefined : undefined} onSuccess={async () => { await fetchApplication(); setEditing(false); }} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Card */}
                <Card className="lg:col-span-2 border-slate-100 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Application Profile
                      </CardTitle>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Archived</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                        <p className="text-sm font-semibold text-slate-900 uppercase">{application.fullName}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
                        <p className="text-sm font-semibold text-slate-900 tracking-tight">{application.email}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Academic Institution</label>
                        <p className="text-sm font-semibold text-slate-900">{application.school}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Primary Department</label>
                        <p className="text-sm font-bold text-blue-600 uppercase italic">{application.committee ?? application.ocRole ?? '—'}</p>
                      </div>
                    </div>
                    
                    <div className="pt-8 border-t border-slate-50">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Motivation Statement</label>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed italic border-l-2 border-blue-100 pl-4">"{application.motivation}"</p>
                    </div>

                    {/* Secretariat Communication — show admin notes or a default error message */}
                    <div className={`p-5 rounded-xl border ${application?.adminNotes ? 'bg-blue-50/50 border-blue-100/50' : 'bg-rose-50 border-rose-100'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className={`w-3.5 h-3.5 ${application?.adminNotes ? 'text-blue-600' : 'text-rose-600'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: application?.adminNotes ? undefined : '#9f1239' }}>Secretariat Communication</span>
                      </div>
                      <p className={`text-sm leading-relaxed font-medium ${application?.adminNotes ? 'text-blue-800/80' : 'text-rose-800'}`}>
                        {application?.adminNotes ?? 'Internal evaluation system error.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Editing locked once application exists — no edit option shown */}

                {/* Tracking Sidebar */}
                <div className="space-y-8">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-blue-100/20">
                    <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-blue-400">Institutional Review</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-8">
                      Your application is currently being cross-referenced with departmental requirements. Selection is based on intellectual rigor and leadership potential.
                    </p>
                    <div className="h-1 w-full bg-white/10 rounded-full mb-2">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Process: {progressPercent}% Complete</span>
                  </div>

                  <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm">
                    <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-6">Recruitment Flow</h5>
                    <ul className="space-y-6">
                      {[
                        { step: 1, label: 'Profile Evaluation' },
                        { step: 2, label: 'Departmental Interview' },
                        { step: 3, label: 'Board Finalization' },
                      ].map((item, idx) => {
                        const completed = item.step < currentStep
                        const active = item.step === currentStep
                        return (
                          <li key={idx} className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${completed ? 'bg-emerald-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                              {item.step}
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-tight ${active || completed ? 'text-slate-900' : 'text-slate-300'}`}>
                              {item.label}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-50 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div className="flex items-center gap-2 grayscale opacity-40">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[9px] font-bold text-slate-900 tracking-widest uppercase">Oasis Institutional System</span>
          </div>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">
            Digital Secretariat • KIMUN 2026 • Confidential
          </p>
        </div>
      </footer>
    </div>
  )
}