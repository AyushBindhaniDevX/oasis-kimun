import { NextRequest, NextResponse } from 'next/server'
import { evaluateApplication } from '@/lib/ai-service'
import { sendResendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()

    const evaluation = await evaluateApplication(applicationData)

    // Notify applicant with evaluation summary if email present (best-effort)
    try {
      const applicantEmail = applicationData?.email
      if (applicantEmail) {
        const templates = await import('@/lib/email-templates')
        const html = templates.evaluationResultTemplate({
          fullName: applicationData?.fullName,
          score: evaluation?.score,
          assessment: evaluation?.assessment,
        })

        await sendResendEmail({ to: applicantEmail, subject: 'Oasis — Application Evaluation', html })
      }
    } catch (emailErr) {
      console.error('Failed to send evaluation email:', emailErr)
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate application' },
      { status: 500 }
    )
  }
}
