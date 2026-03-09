import { NextRequest, NextResponse } from 'next/server'
import { evaluateApplication } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()

    const evaluation = await evaluateApplication(applicationData)

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate application' },
      { status: 500 }
    )
  }
}
