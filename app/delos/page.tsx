'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, Trophy, Briefcase, School, User, Hash, 
  Star, ArrowLeft, ShieldAlert, CheckCircle2, Lock,
  Award, Medal, Zap, GraduationCap
} from 'lucide-react'
import Link from 'next/link'

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://whenyhkzmhgdrvukgbxm.supabase.co"
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZW55aGt6bWhnZHJ2dWtnYnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODY3NzksImV4cCI6MjA4NzI2Mjc3OX0.6yfUMmN1rr1hQ5b4hv4l2goJQJswZfJNpV3vgZsONRY"

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function DelegateLookup() {
  const [searchTerm, setSearchTerm] = useState('')
  const [delegates, setDelegates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDelegate, setSelectedDelegate] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Masking sensitive contact info
  const maskData = (str: string) => {
    if (!str) return "Hidden";
    return `${str.substring(0, 3)}••••••••`;
  };

  const searchDelegates = async () => {
    if (!searchTerm.trim()) return
    setLoading(true)
    setError(null)
    
    const { data, error: sbError } = await supabase
      .from('delegate')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,institution.ilike.%${searchTerm}%`)
      .order('ranking_score', { ascending: false }) // SORT BY RANKING SCORE
      .limit(10)

    if (sbError) {
      setError("Database connection error.");
    } else {
      setDelegates(data || [])
      if (data?.length === 0) setError("No delegate records found.");
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-blue-100">
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Oasis Dashboard</span>
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-100 mb-4">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-5xl font-light tracking-tight italic">Leaderboard <span className="font-bold not-italic text-blue-600">Sync.</span></h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto uppercase tracking-tighter font-medium">Ranked by Global Performance Score</p>
          
          <div className="flex gap-2 max-w-lg mx-auto mt-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input 
                placeholder="Search Name or College..." 
                className="pl-11 h-14 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchDelegates()}
              />
            </div>
            <Button onClick={searchDelegates} disabled={loading} className="h-14 px-8 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-bold transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100">
              {loading ? "..." : "Query"}
            </Button>
          </div>
        </div>

        {/* Results List */}
        {!selectedDelegate && delegates.length > 0 && (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4">
            {delegates.map((d, index) => (
              <button key={d.uuid} onClick={() => setSelectedDelegate(d)} className="w-full text-left p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-black text-slate-100 group-hover:text-blue-50 transition-colors w-8 text-center italic">
                    {index + 1}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 font-bold text-xl">
                    {d.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{d.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-2">
                       <School className="w-3 h-3" /> {d.institution || "Independent"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-300 uppercase">Score</p>
                    <p className="text-xl font-black text-blue-600">{d.ranking_score || 0}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Detail View */}
        {selectedDelegate && (
          <div className="animate-in zoom-in-95 duration-500">
            <Button variant="ghost" onClick={() => setSelectedDelegate(null)} className="mb-6 text-slate-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3 mr-2" /> Back to Rankings
            </Button>

            <Card className="border-none shadow-2xl shadow-blue-100/50 overflow-hidden rounded-[3rem] bg-white">
                {/* Header Section */}
                <div className="h-48 bg-slate-900 relative flex items-end px-12 pb-8">
                   <div className="relative z-10 flex items-center gap-6 text-white w-full justify-between">
                      <div className="flex items-center gap-6">
                        <div className="p-1 bg-white rounded-[2rem] shadow-2xl shadow-black">
                            <div className="w-24 h-24 bg-blue-50 rounded-[1.8rem] flex items-center justify-center text-blue-600 font-bold text-3xl">{selectedDelegate.name[0]}</div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold tracking-tighter italic">{selectedDelegate.name}</h2>
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                                {selectedDelegate.verified ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3 h-3" />} 
                                {selectedDelegate.institution || "Global Delegate"}
                            </p>
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Rank</p>
                        <p className="text-4xl font-black italic">#{selectedDelegate.ranking_score > 0 ? "Elite" : "N/A"}</p>
                      </div>
                   </div>
                </div>

                <CardContent className="p-12">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <StatBox icon={<Zap />} label="Score" value={selectedDelegate.ranking_score || 0} color="text-yellow-500" />
                    <StatBox icon={<GraduationCap />} label="Exp" value={`${selectedDelegate.mun_experience || 0} MUNs`} color="text-blue-600" />
                    <StatBox icon={<Medal />} label="EB Posts" value={selectedDelegate.eb_count || 0} color="text-purple-600" />
                    <StatBox icon={<Hash />} label="ID" value={selectedDelegate.delegate_id || "TEMP"} color="text-slate-400" />
                  </div>

                  {/* Achievements Grid */}
                  <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.4em] mb-4">Official Awards History</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AwardItem label="Best Delegate" count={selectedDelegate.best_delegate} icon={<Award className="text-yellow-500" />} />
                            <AwardItem label="High Commendation" count={selectedDelegate.high_commendation} icon={<Trophy className="text-blue-500" />} />
                            <AwardItem label="Special Mention" count={selectedDelegate.special_mention} icon={<Medal className="text-slate-400" />} />
                        </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.4em]">Confidential</h4>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                        <InfoRow label="Email" value={maskData(selectedDelegate.email)} />
                        <InfoRow label="Phone" value={maskData(selectedDelegate.phone)} />
                        <div className="pt-2">
                           <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-widest">Privacy Protected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

// --- Helper UI Components ---
function AwardItem({ label, count, icon }: any) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">{icon}</div>
            <div>
                <p className="text-lg font-black text-slate-900 leading-none">{count || 0}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    )
}

function StatBox({ icon, label, value, color }: any) {
  return (
    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-50">
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
    <div className="flex justify-between items-center">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-bold text-slate-900">{value}</span>
    </div>
  )
}
