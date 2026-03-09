'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Mail, Zap, Search, ShieldCheck, Globe, FileText, Loader2 } from 'lucide-react'
import { ref, onValue, update } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { evaluateApplication } from '@/lib/ai-service'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Application {
  uid: string
  fullName: string
  email: string
  school: string
  ocRole: string
  motivation: string
  submittedAt: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  aiScore?: number
  photoURL?: string
}

const STATUS_THEMES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
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
          const val = child.val()
          data.push({ 
            uid: child.key, 
            ...val,
            aiScore: val.aiScore !== undefined ? val.aiScore : null 
          })
        })
      }
      setApplications(data)
      setAppsLoading(false)
    }, (error) => {
      setAppsLoading(false)
      toast.error("Oasis Vault Access Denied")
    })

    return () => unsubscribe()
  }, [user, router, authLoading])

  useEffect(() => {
    let filtered = [...applications]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a => 
        a.fullName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter)
    setFilteredApplications(filtered)
  }, [applications, searchQuery, statusFilter])

  const handleAiEvaluate = async (app: Application) => {
    setEvaluatingId(app.uid)
    try {
      const result = await evaluateApplication(app)
      const db = getDatabase()
      
      // Update result in Firebase
      await update(ref(db, `applications/${app.uid}`), {
        aiScore: result.score,
        status: 'under_review'
      })
      
      toast.success(`Merit Scored: ${result.score}/100`)
    } catch (error) {
      toast.error("AI Evaluation Sync Failed")
    } finally {
      setEvaluatingId(null)
    }
  }

  const handleStatusChange = async (uid: string, newStatus: string) => {
    const db = getDatabase()
    await update(ref(db, `applications/${uid}`), { status: newStatus })
    toast.success("Status Synchronized")
  }

  if (authLoading || appsLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Initializing Oasis Vault...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-[0.2em] text-slate-900 leading-none uppercase">Oasis Admin</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">KIMUN 2026</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logout()} className="text-slate-500 hover:text-rose-600 text-[10px] font-bold uppercase tracking-widest">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Applications', count: applications.length, color: 'text-slate-900' },
            { label: 'Awaiting', count: applications.filter(a => a.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Validated', count: applications.filter(a => a.status === 'approved').length, color: 'text-emerald-600' },
            { label: 'Declined', count: applications.filter(a => a.status === 'rejected').length, color: 'text-rose-600' }
          ].map((m, i) => (
            <Card key={i} className="border-slate-100 shadow-sm">
              <CardHeader className="pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{m.label}</CardHeader>
              <CardContent><p className={`text-3xl font-black ${m.color}`}>{m.count}</p></CardContent>
            </Card>
          ))}
        </div>

        {/* List View */}
        <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
          <div className="p-4 flex gap-4 bg-slate-50/50 border-b border-slate-100">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-300" />
                <input 
                  placeholder="Search vault..." 
                  className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9 bg-white border-slate-100 text-[10px] font-bold uppercase tracking-widest">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Reviewing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 border-b border-slate-50 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Merit Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApplications.map((app) => (
                  <tr key={app.uid} className="hover:bg-slate-50/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-100">
                          <AvatarImage src={app.photoURL} />
                          <AvatarFallback className="bg-slate-50 text-blue-600 font-bold text-[10px] uppercase">{app.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none uppercase">{app.fullName}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-tight uppercase">{app.ocRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {app.aiScore ? (
                        <div className="inline-flex flex-col">
                          <span className="text-sm font-black text-blue-600">{app.aiScore}%</span>
                          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                             <div className="h-full bg-blue-500" style={{ width: `${app.aiScore}%` }} />
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAiEvaluate(app)}
                          disabled={evaluatingId === app.uid}
                          className="text-slate-300 hover:text-blue-500"
                        >
                          {evaluatingId === app.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <Select value={app.status} onValueChange={(v) => handleStatusChange(app.uid, v)}>
                        <SelectTrigger className={`h-7 w-[110px] text-[9px] font-black uppercase tracking-widest ${STATUS_THEMES[app.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">Reviewing</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-blue-600"><FileText className="w-4 h-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl border-none">
                          <DialogHeader className="border-b border-slate-50 pb-4">
                             <div className="flex items-center gap-2 mb-1">
                               <ShieldCheck className="w-4 h-4 text-blue-600" />
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secretariat Dossier</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold uppercase tracking-tight">{app.fullName}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Statement of Intent</p>
                            <p className="text-sm bg-slate-50 p-6 rounded-2xl italic text-slate-600 leading-relaxed">"{app.motivation}"</p>
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
      </main>
    </div>
  )
}