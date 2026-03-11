'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, Trophy, Briefcase, School, User, Hash, 
  Star, ArrowLeft, AlertOctagon, ShieldAlert, CheckCircle2 
} from 'lucide-react'
import Link from 'next/link'

// --- SUPABASE CONFIGURATION ---
// Using Environment Variables is safer for Vercel deployments.
// Make sure to add these in your Vercel Project Settings.
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://whenyhkzmhgdrvukgbxm.supabase.co"
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZW55aGt6bWhnZHJ2dWtnYnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODY3NzksImV4cCI6MjA4NzI2Mjc3OX0.6yfUMmN1rr1hQ5b4hv4l2goJQJswZfJNpV3vgZsONRY"

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function DelegateLookup() {
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
      .limit(8)

    if (sbError) {
      setError("Database connection failed. Please check your network.")
    } else {
      setDelegates(data || [])
      if (data?.length === 0) setError("No delegate found with those details.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Back to Oasis</span>
          </Link>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none">Delegate Portal</span>
            <span className="text-[8px] font-medium text-blue-600 uppercase tracking-tighter">Verification System v2.0</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Search Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-light tracking-tight">Identity <span className="font-semibold">Verification.</span></h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Access your official KIMUN 2026 delegate records and performance history.</p>
          
          <div className="flex gap-2 max-w-lg mx-auto mt-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input 
                placeholder="Search Name or Institution..." 
                className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchDelegates()}
              />
            </div>
            <Button onClick={searchDelegates} disabled={loading} className="h-14 px-8 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold transition-all uppercase text-[10px] tracking-widest">
              {loading ? "Processing..." : "Verify"}
            </Button>
          </div>
          {error && <p className="text-red-500 text-xs font-bold mt-4 uppercase tracking-tighter">{error}</p>}
        </div>

        {/* List Results */}
        {!selectedDelegate && delegates.length > 0 && (
          <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-2">
            {delegates.map((d) => (
              <button 
                key={d.id} 
                onClick={() => setSelectedDelegate(d)}
                className="w-full text-left p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors font-bold uppercase">
                    {d.name ? d.name[0] : '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{d.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{d.institution}</p>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180 text-slate-300 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        )}

        {/* Detailed Profile View */}
        {selectedDelegate && (
          <div className="animate-in zoom-in-95 duration-300">
            <Button variant="ghost" onClick={() => setSelectedDelegate(null)} className="mb-6 text-slate-400 hover:text-slate-900 text-[10px] font-bold uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3 mr-2" /> Back to Search
            </Button>

            {selectedDelegate.status === 'blacklisted' ? (
              <Card className="border-red-100 bg-red-50/30 overflow-hidden rounded-[2.5rem] border-2">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 animate-pulse">
                    <AlertOctagon className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-red-900 uppercase tracking-tighter">Access Restricted</h2>
                    <p className="text-red-700/70 text-sm max-w-xs mx-auto">
                      Delegate <span className="font-bold">"{selectedDelegate.name}"</span> has been flagged. Access to portal features is currently suspended.
                    </p>
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">Contact Secretariat for Appeals</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-2xl shadow-blue-100/50 overflow-hidden rounded-[2.5rem] bg-white border border-slate-50">
                <div className="h-40 bg-slate-900 relative flex items-end px-10 pb-6">
                   <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Ccircle cx='2' cy='2' r='1' fill='%23fff'/%3E%3C/svg%3E")` }} />
                   <div className="relative z-10 flex items-center gap-4 text-white">
                      <div className="p-1 bg-white rounded-2xl shadow-lg">
                        <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><User className="w-10 h-10" /></div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight">{selectedDelegate.name}</h2>
                        <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Delegate
                        </div>
                      </div>
                   </div>
                </div>

                <CardContent className="p-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <StatBox icon={<Trophy />} label="Rank" value={`#${selectedDelegate.rank || 'N/A'}`} color="text-orange-500" />
                    <StatBox icon={<Briefcase />} label="Committee" value={selectedDelegate.committee || 'TBD'} color="text-blue-600" />
                    <StatBox icon={<Star />} label="Experience" value={selectedDelegate.experience || 'Novice'} color="text-purple-600" />
                    <StatBox icon={<School />} label="Institution" value={selectedDelegate.institution?.split(' ')[0] || 'N/A'} color="text-slate-600" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Credentials</h4>
                      <div className="space-y-3">
                        <InfoRow label="Email Address" value={selectedDelegate.email} />
                        <InfoRow label="Phone Number" value={selectedDelegate.phone} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Security Token</h4>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-400 flex items-center gap-3">
                        <Hash className="w-3 h-3" /> {selectedDelegate.id}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// --- Helper Components ---
function StatBox({ icon, label, value, color }: any) {
  return (
    <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 hover:scale-105 transition-transform">
      <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3 ${color}`}>
        {/* FIXED: Using React.cloneElement correctly */}
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
      <span className="text-xs font-semibold text-slate-700 truncate ml-4">{value}</span>
    </div>
  )
}
