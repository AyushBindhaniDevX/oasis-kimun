'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Trophy, 
  School, 
  User, 
  Hash, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Lock,
  Award, 
  Medal, 
  Zap, 
  GraduationCap, 
  ShieldCheck,
  ArrowRight,
  AlertOctagon,
  FileSearch,
  Star
} from 'lucide-react'
import Link from 'next/link'

// --- SUPABASE CONFIG ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OasisPortal() {
  const [searchTerm, setSearchTerm] = useState('')
  const [delegates, setDelegates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDelegate, setSelectedDelegate] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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

    if (sbError) setError("Access Denied: Database connection failed.")
    else {
      setDelegates(data || [])
      if (data?.length === 0) setError("No matching records found in the centralized archive.")
    }
    setLoading(false)
  }

  const maskData = (str: string) => str ? `${str.substring(0, 3)}••••••••` : "Hidden";

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md h-20 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-[0.2em] uppercase leading-none">OASIS</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Diplomatic Management Engine</span>
          </div>
        </div>
        <Link href="/">
          <Button variant="outline" className="rounded-full px-6 border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
            Exit Secure Portal
          </Button>
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Archive Connection Active
          </div>
          <h1 className="text-5xl font-light tracking-tight text-slate-900 leading-tight">Identity <span className="font-semibold italic">Archive.</span></h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Verify credentials and performance history in the Centralized Database.</p>
        </div>

        {/* Search Input */}
        <div className="flex gap-3 max-w-xl mx-auto mb-16 group">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by Full Name or Institution..." 
              className="h-16 pl-14 rounded-3xl border-none shadow-2xl shadow-slate-100 focus:ring-2 focus:ring-blue-500 bg-white text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchDelegates()}
            />
          </div>
          <Button onClick={searchDelegates} disabled={loading} className="h-16 px-10 bg-slate-900 hover:bg-blue-600 text-white rounded-3xl font-bold transition-all uppercase text-[10px] tracking-widest shadow-xl">
            {loading ? "querying..." : "Verify Record"}
          </Button>
        </div>

        {/* Dynamic Display Logic */}
        {!selectedDelegate ? (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {delegates.map((d) => (
              <button key={d.uuid} onClick={() => setSelectedDelegate(d)} className="w-full text-left p-6 bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors uppercase">{d.name[0]}</div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{d.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-2"><School className="w-3 h-3" /> {d.institution}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="hidden sm:block">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">Archive Score</p>
                    <p className="text-xl font-black text-blue-600 leading-none">{d.ranking_score || 0}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
            {error && (
              <div className="p-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <FileSearch className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}
          </div>
        ) : (
          /* SELECTED DELEGATE CARD */
          <div className="animate-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            <Button variant="ghost" onClick={() => setSelectedDelegate(null)} className="mb-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-blue-600 p-0 flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Back to List
            </Button>

            {selectedDelegate.status === 'blacklisted' ? (
              <Card className="border-red-100 bg-red-50/20 overflow-hidden rounded-[3.5rem] border-2">
                <CardContent className="p-16 text-center space-y-8">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-xl shadow-red-100 animate-pulse">
                    <AlertOctagon className="w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-red-900 uppercase tracking-tighter">Security Restriction</h2>
                    <p className="text-red-700/70 text-sm max-w-md mx-auto leading-relaxed">
                      Archive entry for <span className="font-bold text-red-900">"{selectedDelegate.name}"</span> has been flagged for violations. Verification is currently suspended.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3.5rem] overflow-hidden bg-white border border-slate-100">
                <div className="h-48 bg-slate-900 relative flex items-end px-12 pb-10 overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
                   <div className="relative z-10 flex items-center gap-6 text-white w-full">
                      <div className="p-1.5 bg-white/10 backdrop-blur-xl rounded-[2.2rem]">
                        <div className="w-24 h-24 bg-white rounded-[1.8rem] flex items-center justify-center text-blue-600 font-black text-3xl shadow-2xl">{selectedDelegate.name[0]}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-4xl font-bold tracking-tighter">{selectedDelegate.name}</h2>
                          {selectedDelegate.verified && <CheckCircle2 className="w-6 h-6 text-blue-400 fill-blue-400/10" />}
                        </div>
                        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2 italic">
                           {selectedDelegate.institution || "Global Diplomat"}
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="px-5 py-2.5 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-2 text-green-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Security Cleared</span>
                        </div>
                      </div>
                   </div>
                </div>

                <CardContent className="p-12">
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
                    <StatBox icon={<Zap />} label="Score" value={selectedDelegate.ranking_score || 0} color="text-yellow-500" />
                    <StatBox icon={<GraduationCap />} label="Exp" value={`${selectedDelegate.mun_experience || 0}`} color="text-blue-600" />
                    <StatBox icon={<Award />} label="Best Del" value={selectedDelegate.best_delegate || 0} color="text-purple-600" />
                    <StatBox icon={<Trophy />} label="High Comm" value={selectedDelegate.high_commendation || 0} color="text-orange-500" />
                    <StatBox icon={<Medal />} label="Spl Mention" value={selectedDelegate.special_mention || 0} color="text-slate-500" />
                    <StatBox icon={<Hash />} label="Token ID" value={selectedDelegate.delegate_id || "DE-2026"} color="text-slate-400" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Lock className="w-3 h-3 text-blue-600" /> Diplomatic Credentials
                      </h4>
                      <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                        <InfoRow label="Secure Email" value={maskData(selectedDelegate.email)} />
                        <InfoRow label="Verified Phone" value={maskData(selectedDelegate.phone)} />
                      </div>
                    </div>
                    
                    {/* DISCIPLINARY HISTORY LOGIC */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.4em] flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 text-blue-600" /> Security Archive
                      </h4>
                      
                      {selectedDelegate.disciplinary_history && selectedDelegate.disciplinary_history !== 'No disciplinary actions recorded.' ? (
                        <div className="p-6 bg-red-50/50 rounded-[2rem] border border-red-100 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <AlertOctagon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-red-800 leading-tight mb-1 uppercase font-mono tracking-tighter">Action Recorded</p>
                            <p className="text-[10px] text-red-700 leading-relaxed italic">"{selectedDelegate.disciplinary_history}"</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-green-50/30 rounded-[2rem] border border-green-100 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-green-800 leading-tight mb-1">No Disciplinary History</p>
                            <p className="text-[9px] text-green-700/60 uppercase font-black tracking-tighter">Verified Official Record • KIMUN 2026</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Support Section */}
        <section className="mt-32 max-w-5xl mx-auto">
          <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-16 text-white relative overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -mr-20 -mt-20" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.4em]">Secretariat Support</h2>
                </div>
                <h3 className="text-3xl font-light leading-tight italic leading-snug">Need to update your <span className="font-semibold underline decoration-blue-500 decoration-2 underline-offset-8 not-italic">Official Record?</span></h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                  To maintain diplomatic integrity, all corrections to experience scores require formal verification from the Registrar.
                </p>
              </div>
              <div className="space-y-5">
                <Link href="mailto:kalingainternationalmodelun@gmail.com" className="block p-7 bg-blue-600 hover:bg-blue-700 rounded-3xl transition-all text-center group shadow-xl">
                  <span className="font-bold uppercase text-[10px] tracking-[0.2em] text-white flex items-center justify-center gap-2">
                    Contact Registrar Office <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <div className="flex items-center justify-center gap-6 opacity-30">
                  <span className="text-[8px] font-bold uppercase tracking-widest italic">Manual Audit System Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function StatBox({ icon, label, value, color }: any) {
  return (
    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 group">
      <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900 truncate">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-bold text-slate-900 truncate ml-4">{value}</span>
    </div>
  )
}
