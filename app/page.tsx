import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, ShieldCheck, Globe, Users, Award, BookOpen, Target } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54 48c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4zM6 48c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} 
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-16 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-[0.2em] text-slate-900 leading-none">OASIS</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">KIMUN 2026</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-6 border-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-50">
                Portal Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          OC Recruitment Phase I is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tight mb-8">
          Build the <span className="font-semibold text-blue-600">Legacy.</span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Oasis is the specialized management engine for the Kalinga International Model United Nations. Join the Organizing Committee to drive innovation in student diplomacy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all gap-2">
              Apply for OC <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Content Sections */}
      <main className="max-w-5xl mx-auto px-6 space-y-32 pb-32">
        
        {/* About KIMUN */}
        <section className="grid md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-2">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em] mb-4">About KIMUN</h2>
            <h3 className="text-3xl font-bold text-slate-900 leading-tight">Empowering the next generation of leaders.</h3>
          </div>
          <div className="md:col-span-3 space-y-6 text-slate-600 text-sm leading-relaxed">
            <p>
              Kalinga International Model United Nations (KIMUN) is a student-led diplomatic simulation platform dedicated to empowering young leaders through debate, diplomacy, and global engagement.
            </p>
            <p>
              Founded with the vision of creating a space where students can engage with real-world international issues, KIMUN brings together delegates from diverse academic and cultural backgrounds to simulate the workings of global institutions.
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 uppercase text-[10px] tracking-widest">Skill Development Focus:</h4>
              <ul className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-500 uppercase tracking-tight">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Public speaking</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Negotiation</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Int. Relations</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Leadership</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Policy Analysis</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid md:grid-cols-2 gap-8">
          <Card className="border-slate-100 bg-white shadow-sm p-8 rounded-3xl">
            <Target className="w-8 h-8 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight uppercase text-[12px]">Our Vision</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              To become one of the most influential student diplomacy platforms in India that inspires youth to think globally, lead responsibly, and collaborate across cultures.
            </p>
          </Card>
          <Card className="border-slate-100 bg-white shadow-sm p-8 rounded-3xl">
            <Award className="w-8 h-8 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight uppercase text-[12px]">Our Mission</h3>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li className="flex gap-2"><span>•</span> Promote diplomatic dialogue among students</li>
              <li className="flex gap-2"><span>•</span> Provide experiential learning about global governance</li>
              <li className="flex gap-2"><span>•</span> Encourage leadership and collaboration</li>
              <li className="flex gap-2"><span>•</span> Build a community of future change-makers</li>
            </ul>
          </Card>
        </section>

        {/* Legacy */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em]">Legacy</h2>
            <h3 className="text-4xl font-light text-slate-900">Ambition meets <span className="font-semibold underline decoration-blue-600 decoration-4 underline-offset-8">Diplomacy.</span></h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase">A Growing Platform</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Since its inception, KIMUN has grown into a community of future leaders where ambition meets diplomacy across geopolitical challenges.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Tradition of Excellence</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Each edition builds upon the previous one, fostering intellectual rigor, respectful debate, and cultural exchange.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Transformation</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Over the years, delegates transform from students into diplomats, negotiators, and global citizens prepared to lead.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values & Highlights */}
        <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-8">What Makes Us Different</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0"><Globe className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wide">Global Perspective</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">Committees address real international issues, encouraging delegates to think beyond borders.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wide">Skill Development</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">Delegates gain practical experience in diplomacy, policy writing, and negotiation.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0"><Users className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wide">Student-Led Leadership</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">The conference is organized by a dynamic student team dedicated to creating meaningful experiences.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-8">Core Values</h2>
              <div className="grid grid-cols-2 gap-6">
                {['Diplomacy', 'Leadership', 'Critical Thinking', 'Collaboration'].map((value) => (
                  <div key={value} className="p-6 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors">
                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-2 tracking-widest leading-none">Primary</p>
                    <p className="font-bold text-lg">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold text-slate-900 tracking-widest uppercase">Oasis v2.0</span>
          </div>
          <div className="text-right">
             <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1">Kalinga International MUN</p>
             <p className="text-slate-300 text-[9px] uppercase tracking-tighter italic">Transforming Students into Global Citizens</p>
          </div>
        </div>
      </footer>
    </div>
  )
}