import { NextResponse } from 'next/server'
import { sendResendEmail } from '@/lib/email'
import {
  applicationReceivedTemplate,
  interviewScheduledTemplate,
  evaluationResultTemplate,
} from '@/lib/email-templates'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { template, data } = body

    if (!template) {
      return NextResponse.json({ error: 'template is required' }, { status: 400 })
    }

    let html: string | undefined
    let subject = 'Oasis Notification'

    switch (template) {
      case 'application_received':
        html = applicationReceivedTemplate(data || {})
        subject = 'Oasis — Application Received'
        break
      case 'interview_scheduled':
        html = interviewScheduledTemplate(data || {})
        subject = 'Oasis — Interview Scheduled'
        break
      case 'evaluation_result':
        html = evaluationResultTemplate(data || {})
        subject = 'Oasis — Application Evaluation'
        break
      default:
        return NextResponse.json({ error: 'unknown template' }, { status: 400 })
    }

    if (!data?.to) {
      return NextResponse.json({ error: 'recipient (to) required in data' }, { status: 400 })
    }

    const result = await sendResendEmail({ to: data.to, subject, html })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('Template email send error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
