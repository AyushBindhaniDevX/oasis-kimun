import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap');
        .serif { font-family: 'DM Serif Display', serif; }
        .pulse-dot::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #4F46E5;
          border-radius: 50%;
          margin-right: 6px;
          animation: pulse 2s infinite;
          vertical-align: middle;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-12 py-5 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium tracking-tight">Oasis</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Platform</a>
          <a href="#" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="#" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">About</a>
          <Link href="/login">
            <Button size="sm" className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-lg shadow-none">
              Apply Now
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-12 pt-24 pb-20 text-center">
        <div className="pulse-dot inline-flex items-center text-[11px] font-medium tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mb-8">
          Recruitment Platform
        </div>
        <h1 className="serif text-[clamp(44px,6vw,68px)] font-normal leading-[1.06] tracking-[-0.02em] text-slate-900 mb-5">
          Build the<br />
          <em className="text-indigo-600 not-italic" style={{ fontStyle: 'italic' }}>next cohort.</em>
        </h1>
        <p className="text-base text-slate-500 font-light leading-relaxed max-w-md mx-auto mb-10">
          Oasis is the recruitment and cohort management platform built for student organizations — streamlined hiring, transparent evaluation, sustainable growth.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/login">
            <Button size="lg" className="h-11 px-7 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-none gap-2">
              Apply Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-11 px-7 text-sm font-normal rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shadow-none">
            Learn more
          </Button>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-y border-slate-100 bg-slate-50 py-5 flex justify-center gap-16">
        {[
          { number: '500+', label: 'Organizations' },
          { number: '12k', label: 'Members placed' },
          { number: '94%', label: 'Retention rate' },
          { number: '48h', label: 'Avg. review time' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="serif text-2xl text-slate-900 tracking-tight">{s.number}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* BENTO GRID */}
      <main className="max-w-5xl mx-auto px-12 py-16">
        <div className="grid grid-cols-3 gap-3">

          {/* Recruitment Pipeline — spans 2 cols */}
          <div className="col-span-2 border border-slate-100 rounded-2xl p-7 hover:border-indigo-200 transition-colors">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="4" width="16" height="2.5" rx="1.25" fill="#4F46E5" opacity="0.3"/>
                <rect x="1" y="8" width="11" height="2.5" rx="1.25" fill="#4F46E5" opacity="0.6"/>
                <rect x="1" y="12" width="7" height="2.5" rx="1.25" fill="#4F46E5"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-2 tracking-tight">Recruitment Pipeline</h3>
            <p className="text-[13px] text-slate-500 font-light leading-relaxed">
              Manage every stage of your intake — from application to final offer — in one structured, transparent workflow.
            </p>
            <ul className="mt-4 space-y-2">
              {['Custom application stages and scoring rubrics', 'Collaborative review with committee voting', 'Automated status notifications for applicants'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-[12px] text-slate-500">
                  <span className="w-1 h-1 rounded-full bg-indigo-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Skills Assessment — dark */}
          <div className="bg-slate-900 rounded-2xl p-7">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5" opacity="0.4"/>
                <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-white mb-2 tracking-tight">Skills Assessment</h3>
            <p className="text-[13px] text-white/50 font-light leading-relaxed">
              Match candidates to roles with structured evaluation frameworks — built to reduce bias and increase signal.
            </p>
          </div>

          {/* Cohort Onboarding */}
          <div className="border border-slate-100 rounded-2xl p-7 hover:border-indigo-200 transition-colors">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="6" cy="6" r="3" fill="#4F46E5" opacity="0.5"/>
                <circle cx="13" cy="6" r="3" fill="#4F46E5" opacity="0.8"/>
                <path d="M1 15c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                <path d="M9 15c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-2 tracking-tight">Cohort Onboarding</h3>
            <p className="text-[13px] text-slate-500 font-light leading-relaxed mb-4">
              Structured orientation flows that get every new member up to speed — fast.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Checklists', 'Role guides', 'Mentorship'].map((tag, i) => (
                <span key={tag} className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${i === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="border border-slate-100 rounded-2xl p-7 hover:border-indigo-200 transition-colors">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="10" width="3" height="6" rx="1" fill="#4F46E5" opacity="0.4"/>
                <rect x="7" y="6" width="3" height="10" rx="1" fill="#4F46E5" opacity="0.7"/>
                <rect x="12" y="2" width="3" height="14" rx="1" fill="#4F46E5"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-2 tracking-tight">Performance Analytics</h3>
            <p className="text-[13px] text-slate-500 font-light leading-relaxed mb-4">
              Track cohort health and individual progress with dashboards built for org leads.
            </p>
            <div className="flex gap-1.5">
              {['Retention', 'Engagement'].map((tag, i) => (
                <span key={tag} className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${i === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Knowledge Transfer */}
          <div className="border border-slate-100 rounded-2xl p-7 hover:border-indigo-200 transition-colors">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="3" width="12" height="10" rx="2" fill="none" stroke="#4F46E5" strokeWidth="1.4" opacity="0.5"/>
                <path d="M6 7h6M6 10h4" stroke="#4F46E5" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M7 13l2 3 2-3" stroke="#4F46E5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-2 tracking-tight">Knowledge Transfer</h3>
            <p className="text-[13px] text-slate-500 font-light leading-relaxed">
              Preserve institutional memory across cohort cycles — document processes, decisions, and culture.
            </p>
          </div>

        </div>
      </main>

      {/* CTA SECTION */}
      <section className="max-w-5xl mx-auto px-12 pb-20">
        <div className="bg-slate-900 rounded-2xl px-16 py-14 flex items-center justify-between gap-12">
          <div>
            <h2 className="serif text-[32px] font-normal text-white leading-tight tracking-tight mb-3">
              Ready to build your <em className="text-indigo-300" style={{ fontStyle: 'italic' }}>next cohort?</em>
            </h2>
            <p className="text-[14px] text-white/45 font-light leading-relaxed max-w-sm">
              Join hundreds of student organizations already using Oasis to hire smarter and grow faster.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <Link href="/login">
              <Button size="lg" className="h-11 px-8 bg-white hover:bg-slate-100 text-slate-900 text-sm font-medium rounded-xl shadow-none">
                Apply Now
              </Button>
            </Link>
            <span className="text-[11px] text-white/30 tracking-wide">Free for student organizations</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-7 px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
          <span className="text-[12px] text-slate-400">Oasis — Recruitment Platform</span>
        </div>
        <span className="text-[11px] text-slate-400 tracking-wide">© 2026 Oasis. Built for student-led teams.</span>
      </footer>

    </div>
  )
}