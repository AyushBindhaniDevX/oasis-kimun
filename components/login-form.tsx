'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ShieldCheck } from 'lucide-react'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Auth Error:', error)
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[80vh] bg-white px-4", className)} {...props}>
      <Card className="w-full max-w-[400px] border-none shadow-none bg-transparent">
        <CardContent className="p-0 space-y-10">
          
          {/* Brand Identity */}
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Oasis v2.0</span>
            </div>
            <h1 className="text-4xl font-light text-slate-900 tracking-tight">
              KIMUN <span className="font-semibold text-blue-600">2026</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Organizing Committee Management Portal
            </p>
          </div>

          {/* Action Area */}
          <div className="space-y-6">
            <Button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full h-14 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all gap-4 rounded-xl font-medium shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {loading ? 'Verifying Identity...' : 'Continue with Google'}
            </Button>
            
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-slate-100" />
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Authorized Access</span>
              <div className="h-[1px] flex-1 bg-slate-100" />
            </div>
          </div>

          {/* Institutional Footer */}
          <footer className="pt-4">
            <p className="text-[11px] text-slate-400 leading-relaxed text-center md:text-left">
              This system is restricted to verified student organizers. <br />
              <a href="#" className="text-slate-900 font-semibold hover:underline underline-offset-4">Read Security Protocol</a>
            </p>
          </footer>

        </CardContent>
      </Card>
    </div>
  )
}