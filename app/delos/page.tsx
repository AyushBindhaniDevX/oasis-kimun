'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  GraduationCap, 
  ShieldCheck,
  ArrowRight,
  AlertOctagon,
  FileSearch,
  Mail,
  Phone,
  Calendar,
  Globe,
  Loader2,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// --- TYPES ---
interface Delegate {
  uuid: string
  name: string
  institution: string
  email: string
  phone: string
  ranking_score: number
  mun_experience: number
  best_delegate: number
  high_commendation: number
  special_mention: number
  delegate_id: string
  verified: boolean
  status: 'active' | 'blacklisted' | 'pending'
  created_at: string
  last_updated: string
  profile_image?: string
  committees_served?: string[]
  languages?: string[]
}

interface SearchState {
  term: string
  results: Delegate[]
  loading: boolean
  error: string | null
}

// --- CONSTANTS ---
const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}

const DELEGATE_STATUS = {
  active: { color: 'text-green-500', bg: 'bg-green-50', label: 'Active' },
  blacklisted: { color: 'text-red-500', bg: 'bg-red-50', label: 'Restricted' },
  pending: { color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending Verification' },
} as const

// --- SUPABASE CLIENT ---
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

// --- UTILITIES ---
const maskData = (str: string, visibleChars: number = 3): string => {
  if (!str) return 'Not provided'
  if (str.length <= visibleChars) return '•'.repeat(str.length)
  return `${str.substring(0, visibleChars)}${'•'.repeat(Math.min(8, str.length - visibleChars))}`
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// --- CUSTOM HOOKS ---
const useDelegateSearch = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    term: '',
    results: [],
    loading: false,
    error: null,
  })

  const searchDelegates = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchState(prev => ({ ...prev, error: 'Please enter a search term' }))
      return
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('delegate')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,institution.ilike.%${searchTerm}%`)
        .order('ranking_score', { ascending: false })
        .limit(20)

      if (error) throw error

      setSearchState(prev => ({
        ...prev,
        results: data || [],
        error: data?.length ? null : 'No delegates found matching your search.',
        loading: false,
      }))
    } catch (err) {
      setSearchState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to search delegates. Please try again.',
        loading: false,
      }))
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchState({
      term: '',
      results: [],
      loading: false,
      error: null,
    })
  }, [])

  return { searchState, searchDelegates, clearSearch }
}

// --- COMPONENTS ---
const Navigation: React.FC = () => (
  <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md h-20 flex items-center justify-between px-6 md:px-12">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
        <ShieldCheck className="w-6 h-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold tracking-[0.2em] uppercase leading-none text-slate-900">OASIS</span>
        <span className="text-[9px] font-medium text-slate-500 uppercase tracking-tight">
          Diplomatic Verification System
        </span>
      </div>
    </div>
    <Link href="/" passHref>
      <Button 
        variant="outline" 
        className="rounded-full px-6 border-slate-300 text-xs font-medium uppercase tracking-wider hover:bg-slate-50 transition-all"
      >
        Exit Secure Portal
      </Button>
    </Link>
  </nav>
)

interface StatBoxProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color?: string
  trend?: 'up' | 'down' | 'neutral'
}

const StatBox: React.FC<StatBoxProps> = ({ icon, label, value, color = 'text-blue-600', trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 transition-all hover:shadow-lg hover:border-blue-200 group">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center", color)}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          trend === 'up' && "text-green-600 bg-green-50",
          trend === 'down' && "text-red-600 bg-red-50",
          trend === 'neutral' && "text-slate-600 bg-slate-50"
        )}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'neutral' && '→'}
        </span>
      )}
    </div>
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
)

interface InfoRowProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  sensitive?: boolean
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, sensitive = false }) => (
  <div className="flex items-center py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 w-1/3">
      {icon && <span className="text-slate-400 w-4 h-4">{icon}</span>}
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex-1">
      <span className="text-sm font-medium text-slate-900">
        {sensitive ? maskData(String(value)) : value}
        {sensitive && <span className="ml-2 text-xs text-slate-400">(Redacted)</span>}
      </span>
    </div>
  </div>
)

interface DelegateCardProps {
  delegate: Delegate
  onClick: (delegate: Delegate) => void
}

const DelegateCard: React.FC<DelegateCardProps> = ({ delegate, onClick }) => (
  <button
    onClick={() => onClick(delegate)}
    className="w-full text-left p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all flex items-center justify-between group"
  >
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-100">
        {delegate.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h4 className="font-semibold text-lg text-slate-900">{delegate.name}</h4>
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <School className="w-3.5 h-3.5" />
          {delegate.institution}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Score</p>
        <p className="text-2xl font-bold text-blue-600">{delegate.ranking_score || 0}</p>
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full",
        delegate.status === 'active' && "bg-green-500",
        delegate.status === 'blacklisted' && "bg-red-500",
        delegate.status === 'pending' && "bg-yellow-500"
      )} />
      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </div>
  </button>
)

interface DelegateProfileProps {
  delegate: Delegate
  onBack: () => void
}

const DelegateProfile: React.FC<DelegateProfileProps> = ({ delegate, onBack }) => {
  const isBlacklisted = delegate.status === 'blacklisted'

  if (isBlacklisted) {
    return (
      <div className="animate-in fade-in duration-500">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mb-8 text-slate-500 text-xs font-medium uppercase tracking-wider hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
        </Button>

        <Card className="border-red-200 bg-red-50/30 rounded-2xl overflow-hidden">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Access Restricted</h2>
            <p className="text-red-700 max-w-md mx-auto">
              This delegate's profile has been flagged for review. Please contact the Registrar's Office for more information.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-8 text-slate-500 text-xs font-medium uppercase tracking-wider hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
      </Button>

      <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-10">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center text-4xl font-bold text-blue-600 shadow-2xl">
              {delegate.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{delegate.name}</h1>
                {delegate.verified && (
                  <CheckCircle2 className="w-6 h-6 text-blue-400 fill-blue-400/20" />
                )}
              </div>
              <p className="text-blue-300 text-sm font-medium flex items-center gap-2">
                <School className="w-4 h-4" />
                {delegate.institution}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  DELEGATE_STATUS[delegate.status].bg,
                  DELEGATE_STATUS[delegate.status].color
                )}>
                  {DELEGATE_STATUS[delegate.status].label}
                </span>
                <span className="text-slate-400 text-xs">
                  Member since {formatDate(delegate.created_at)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-300 mb-1">Global Ranking</p>
              <p className="text-4xl font-bold text-white">{delegate.ranking_score || 0}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-8">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatBox icon={<Award />} label="Best Delegate" value={delegate.best_delegate || 0} />
            <StatBox icon={<Trophy />} label="High Commendation" value={delegate.high_commendation || 0} />
            <StatBox icon={<Medal />} label="Special Mention" value={delegate.special_mention || 0} />
            <StatBox icon={<GraduationCap />} label="MUN Experience" value={delegate.mun_experience || 0} />
            <StatBox icon={<Hash />} label="Delegate ID" value={delegate.delegate_id || 'N/A'} />
          </div>

          {/* Detailed Information */}
          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Contact Information
              </h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <InfoRow label="Email" value={delegate.email} icon={<Mail className="w-4 h-4" />} sensitive />
                <InfoRow label="Phone" value={delegate.phone} icon={<Phone className="w-4 h-4" />} sensitive />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                Verification Status
              </h3>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 mb-1">Clear Record</p>
                    <p className="text-xs text-green-600">
                      This delegate has no disciplinary history and is in good standing with the KIMUN secretariat.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Last updated: {formatDate(delegate.last_updated)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {delegate.committees_served && delegate.committees_served.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Committees Served</h3>
              <div className="flex flex-wrap gap-2">
                {delegate.committees_served.map((committee, index) => (
                  <span key={index} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                    {committee}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// --- MAIN COMPONENT ---
export default function OasisPortal() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null)
  const { searchState, searchDelegates } = useDelegateSearch()

  const handleSearch = useCallback(() => {
    searchDelegates(searchTerm)
  }, [searchTerm, searchDelegates])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }, [handleSearch])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Live Archive</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
            Delegate <span className="font-semibold text-blue-600">Verification</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Access the official KIMUN delegate database. Verify credentials, review performance metrics, 
            and confirm delegate status in real-time.
          </p>
        </div>

        {/* Search Section */}
        {!selectedDelegate && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by delegate name or institution..."
                  className="pl-12 h-14 rounded-xl border-slate-200 bg-white text-base focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={searchState.loading}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searchState.loading}
                className="h-14 px-8 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
              >
                {searchState.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>

            {/* Search Results */}
            <div className="mt-8 space-y-3">
              {searchState.error && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <FileSearch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">{searchState.error}</p>
                </div>
              )}

              {searchState.results.map((delegate) => (
                <DelegateCard
                  key={delegate.uuid}
                  delegate={delegate}
                  onClick={setSelectedDelegate}
                />
              ))}

              {searchState.results.length > 0 && (
                <p className="text-xs text-center text-slate-400 pt-4">
                  Showing {searchState.results.length} result{searchState.results.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Selected Delegate Profile */}
        {selectedDelegate && (
          <DelegateProfile
            delegate={selectedDelegate}
            onBack={() => setSelectedDelegate(null)}
          />
        )}

        {/* Support Section */}
        <section className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />
            
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Registrar Office</span>
                </div>
                <h3 className="text-2xl font-light mb-2">
                  Need to update your record?
                </h3>
                <p className="text-slate-400 text-sm">
                  All changes to delegate records require official verification. Contact the Registrar's Office for assistance.
                </p>
              </div>
              
              <div className="space-y-4">
                <Link 
                  href="mailto:kalingainternationalmodelun@gmail.com"
                  className="block w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-center transition-colors group"
                >
                  <span className="font-medium flex items-center justify-center gap-2">
                    Contact Registrar
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <p className="text-xs text-center text-slate-500">
                  Response time: 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
