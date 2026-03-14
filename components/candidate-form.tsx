'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, Check, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { generateFormSuggestions } from '@/lib/ai-service'
import { ref, set } from 'firebase/database'
import { getDatabase } from '@/lib/firebase'
import { useAuth } from '@/context/auth-context'

// Define the hard deadline: March 14, 2026, 11:59:59 PM
const DEADLINE = new Date('2026-03-14T23:59:59').getTime()

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  school: z.string().min(2, 'School name is required'),
  ocRole: z.string().min(1, 'OC role is required'),
  motivation: z.string().min(10, 'Please tell us why you want to attend'),
})

type FormValues = z.infer<typeof formSchema>

const OC_ROLES = [
  'Delegate Affairs',
  'Logistics',
  'Media & Design',
  'Marketing & Outreach',
  'Sponsorship & Finance',
  'Hospitality',
  'IT / Technical Team',
]

type CandidateFormProps = {
  initialValues?: Partial<FormValues>
  onSuccess?: () => void
}

export function CandidateForm({ initialValues, onSuccess }: CandidateFormProps) {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({})
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialValues?.fullName || '',
      email: initialValues?.email || user?.email || '',
      school: initialValues?.school || '',
      ocRole: initialValues?.ocRole || '',
      motivation: initialValues?.motivation || '',
    },
  })

  // Check deadline on mount and set up interval
  useEffect(() => {
    const checkStatus = () => {
      if (Date.now() > DEADLINE) {
        setIsExpired(true)
      }
    }
    checkStatus()
    const interval = setInterval(checkStatus, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (initialValues) {
      form.reset({
        fullName: initialValues.fullName || '',
        email: initialValues.email || user?.email || '',
        school: initialValues.school || '',
        ocRole: initialValues.ocRole || '',
        motivation: initialValues.motivation || '',
      })
    }
  }, [initialValues, user, form])

  const handleGetSuggestion = async (fieldName: keyof FormValues) => {
    const currentValue = form.getValues(fieldName)
    if (!currentValue) {
      toast.error('Please enter some text first')
      return
    }

    setLoadingSuggestion(fieldName)
    try {
      const suggestion = await generateFormSuggestions(
        fieldName,
        currentValue,
        `KIMUN 2026 ${fieldName} field for ${form.getValues('school') || 'your school'}`
      )
      if (suggestion) {
        setAiSuggestions(prev => ({ ...prev, [fieldName]: suggestion }))
        toast.success('AI suggestion ready!')
      }
    } catch (error) {
      toast.error('Failed to generate suggestion')
    } finally {
      setLoadingSuggestion(null)
    }
  }

  const applySuggestion = (fieldName: keyof FormValues, suggestion: string) => {
    const current = form.getValues(fieldName)
    form.setValue(fieldName, current ? `${current} ${suggestion}` : suggestion)
    setAiSuggestions(prev => {
      const newSuggestions = { ...prev }
      delete newSuggestions[fieldName]
      return newSuggestions
    })
  }

  async function onSubmit(values: FormValues) {
    if (!user) return
    
    // Final safety check for deadline
    if (Date.now() > DEADLINE) {
      setIsExpired(true)
      toast.error('The deadline has passed. We can no longer accept submissions.')
      return
    }

    setSubmitting(true)
    try {
      const db = getDatabase()
      const applicationRef = ref(db, `applications/${user.uid}`)
      
      const applicationData = {
        ...values,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        aiScore: null,
        adminNotes: '',
      }

      await set(applicationRef, applicationData)
      toast.success('Application submitted successfully!')
      setSubmitted(true)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error('Submission error:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // UI for Closed Applications
  if (isExpired) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50/30">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-900">Applications Closed</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            The deadline for KIMUN 2026 applications (March 14, 11:59 PM) has passed. 
            We are no longer accepting new responses.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  // UI for Success State
  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for applying to KIMUN 2026. You'll receive updates via email.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false)
              form.reset()
            }}
            variant="outline"
          >
            Submit Another Application
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>KIMUN 2026 Application Form</CardTitle>
        <CardDescription>
          Deadline: March 14, 2026 | 11:59 PM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleGetSuggestion('fullName')}
                      disabled={loadingSuggestion === 'fullName'}
                    >
                      {loadingSuggestion === 'fullName' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {aiSuggestions.fullName && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-sm">
                      <p className="text-amber-900 mb-2">{aiSuggestions.fullName}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion('fullName', aiSuggestions.fullName)}
                      >
                        Apply Suggestion
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} readOnly className="bg-muted" />
                  </FormControl>
                  <FormDescription>Linked to your Google account</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Enter your school name" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleGetSuggestion('school')}
                      disabled={loadingSuggestion === 'school'}
                    >
                      {loadingSuggestion === 'school' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ocRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OC Role Preference</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an OC role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OC_ROLES.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to join KIMUN 2026?</FormLabel>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Tell us your motivation..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-fit mt-2"
                      onClick={() => handleGetSuggestion('motivation')}
                      disabled={loadingSuggestion === 'motivation'}
                    >
                      {loadingSuggestion === 'motivation' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {aiSuggestions.motivation && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-sm">
                      <p className="text-amber-900 mb-2">{aiSuggestions.motivation}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion('motivation', aiSuggestions.motivation)}
                      >
                        Apply Suggestion
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
