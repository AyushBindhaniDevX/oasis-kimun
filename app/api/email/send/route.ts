import { NextResponse } from 'next/server'
import { sendResendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, html, text, from } = body

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'to, subject and html/text required' }, { status: 400 })
    }

    const result = await sendResendEmail({ to, subject, html, text, from })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
