import { NextResponse } from 'next/server'

const RESEND_API = 'https://api.resend.com/emails'

export async function sendResendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const sender = from || process.env.FROM_EMAIL || `no-reply@oasisplatform.io`

  if (!apiKey) {
    console.error('RESEND_API_KEY not configured')
    throw new Error('RESEND_API_KEY not configured')
  }

  const payload: any = {
    from: sender,
    to,
    subject,
  }

  if (html) payload.html = html
  if (text) payload.text = text

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Resend API error:', res.status, body)
    throw new Error(`Resend API error: ${res.status}`)
  }

  return res.json()
}

export default sendResendEmail
