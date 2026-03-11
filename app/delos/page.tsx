'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Trophy, 
  Briefcase, 
  School, 
  User, 
  Hash, 
  Star, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Lock,
  Award, 
  Medal, 
  Zap, 
  GraduationCap, 
  Crown, 
  TrendingUp,
  ShieldCheck // Added to fix ReferenceError
} from 'lucide-react'
import Link from 'next/link'

// --- SUPABASE CONFIGURATION ---
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://whenyhkzmhgdrvukgbxm.supabase.co"
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZW55aGt6bWhnZHJ2dWtnYnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODY3NzksImV4cCI6MjA4NzI2Mjc3OX0.6yfUMmN1rr1hQ5b4hv4l2goJQJswZfJNpV3vgZsONRY"

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function OasisPortal() {
  const [searchTerm, setSearchTerm] = useState('')
  const [delegates, setDelegates] = useState<any[]>([])
  const [topRankers, setTopRankers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDelegate, setSelectedDelegate] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch Dynamic Top 3 Leaderboard
  useEffect(() => {
    async function getLeaders() {
      const { data } = await supabase
        .from('delegate')
        .select('name, ranking_score, institution')
        .order('ranking_score', { ascending: false })
        .limit(3)
      if (data) setTopRankers(data)
    }
    getLeaders()
  }, [])

  // 2. Centralized Database Search
  const searchDelegates = async () => {
    if (!searchTerm.trim()) return
    setLoading(true)
    setError(null)
    setSelectedDelegate(null)
    
    const { data, error: sbError } = await supabase
      .from('delegate')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,institution.ilike.%${searchTerm}%`)
      .order('ranking_score', { ascending: false })
      .limit(10)

    if (sbError) {
      setError("Database connection error. Try again later.")
    } else {
      setDelegates(data || [])
      if (data?.length === 0) setError("No matching delegate records found.")
    }
    setLoading(false)
  }

  const maskData = (str: string) => str ? `${str.substring(0, 3)}••••••••` : "Hidden";

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md h-16 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold tracking-[0.2em] uppercase">Oasis Portal</span>
        </div>
        <Link href="/">
          <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exit Portal</Button>
        </Link>
      </nav>

      {/* SECTION 1: DYNAMIC LEADERBOARD */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em]">Global Standings</h2>
          <h3 className="text-4xl font-light">The <span className="font-semibold italic">Elite</span> Three.</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {topRankers.length > 0 ? topRankers.map((leader, index) => (
            <Card key={index} className="border-slate-100 shadow-xl shadow-blue-50/50 rounded-[2.5rem] p-8 text-center bg-white border-2 hover:border-blue-100 transition-all">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {index === 0 ? <Crown className="text-yellow-500 w-8 h-8" /> : <Medal className={index === 1 ? "text-slate-400 w-8 h-8" : "text-orange-500 w-8 h-8"} />}
              </div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Rank #0{index + 1}</p>
              <h4 className="text-xl font-bold truncate">{leader.name}</h4>
              <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-slate-50 font-black text-slate-900 uppercase">
                <TrendingUp className="w-3 h-3 text-blue-400" /> {leader.ranking_score || 0} PTS
              </div>
            </Card>
          )) : (
            [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem]" />)
          )}
        </div>
      </section>

      {/* SECTION 2: DELEGATE SEARCH & IDENTITY CARD */}
      <section className="max-w-4xl mx-auto px-6 py-20 bg-slate-50 rounded-[4rem] mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Identity Verification</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-tighter">Centralized Global Database Access</p>
        </div>
        
        <div className="flex gap-2 max-w-lg mx-auto mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <Input 
              placeholder="Full Name or Institution..." 
              className="pl-11 h-14 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchDelegates()}
            />
          </div>
          <Button onClick={searchDelegates} disabled={loading} className="h-14 px-8 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-bold transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100">
            {loading ? "..." : "Verify"}
          </Button>
        </div>

        {!selectedDelegate ? (
          <div className="grid gap-3">
            {delegates.map((d) => (
              <button key={d.uuid} onClick={() => setSelectedDelegate(d)} className="w-full text-left p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-2xl transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase">{d.name[0]}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{d.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{d.institution}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-blue-600">SCORE: {d.ranking_score}</span>
                </div>
              </button>
            ))}
            {error && <p className="text-center text-red-500 text-xs font-bold mt-4 uppercase">{error}</p>}
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-300">
            <Button variant="ghost" onClick={() => setSelectedDelegate(null)} className="mb-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-blue-600 p-0"><ArrowLeft className="w-3 h-3 mr-2" /> Back to List</Button>
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <div className="h-40 bg-slate-900 flex items-center px-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                <h2 className="text-4xl font-bold text-white italic tracking-tighter">{selectedDelegate.name}</h2>
              </div>
              <CardContent className="p-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <StatBox icon={<Zap />} label="Score" value={selectedDelegate.ranking_score || 0} color="text-yellow-500" />
                  <StatBox icon={<GraduationCap />} label="Exp" value={`${selectedDelegate.mun_experience || 0} MUNs`} color="text-blue-600" />
                  <StatBox icon={<Award />} label="Best Del" value={selectedDelegate.best_delegate || 0} color="text-purple-600" />
                  <StatBox icon={<Hash />} label="ID" value={selectedDelegate.delegate_id || "DE-2026"} color="text-slate-400" />
                </div>
                <div className="pt-10 border-t border-slate-100 grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2"><Lock className="w-3 h-3" /> Private Data</h4>
                    <InfoRow label="Email" value={maskData(selectedDelegate.email)} />
                    <InfoRow label="Phone" value={maskData(selectedDelegate.phone)} />
                  </div>
                  <div className="bg-blue-50 p-6 rounded-3xl text-[10px] font-bold text-blue-700 uppercase tracking-[0.2em] flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Certified record from KIMUN Global Secretariat. 2026 Edition.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* SECTION 3: FORMAL SUPPORT */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-16 text-white relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -mr-20 -mt-20" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-[0.4em]">Secretariat Support</h2>
              </div>
              <h3 className="text-3xl font-light leading-tight italic">Need to update your <span className="font-semibold underline decoration-blue-500 decoration-2 underline-offset-8 not-italic">Official Record?</span></h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                To maintain diplomatic integrity, all corrections to scores require a formal review by the Registrar Office.
              </p>
            </div>
            <div className="space-y-4">
              <Link href="mailto:kalingainternationalmodelun@gmail.com" className="block p-7 bg-blue-600 hover:bg-blue-700 rounded-3xl transition-all text-center group">
                <span className="font-bold uppercase text-[10px] tracking-[0.2em] text-white flex items-center justify-center gap-2">
                  Contact Registrar Office <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest font-medium italic">SLA: 48 Business Hours for verification.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// --- HELPER COMPONENTS (Using React.cloneElement to fix crash) ---
function StatBox({ icon, label, value, color }: any) {
  return (
    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-50/50">
      <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 ${color}`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-bold text-slate-900">{value}</span>
    </div>
  )
}
