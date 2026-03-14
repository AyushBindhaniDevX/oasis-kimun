import { NextResponse } from 'next/server'

const DEFAULT_CAL_API_BASE = 'https://api.cal.com/v2'
// Cal.com v2 requires this version header for the bookings endpoint
const CAL_API_VERSION_BOOKINGS = '2024-08-13'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.CAL_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'CAL_API_KEY is not set' }, { status: 500 })
    }

    const body = await request.json()
    const slotStart = body?.slotStart
    const name = body?.name
    const email = body?.email
    const timeZone = body?.timeZone || 'UTC'

    if (!slotStart || !name || !email) {
      return NextResponse.json(
        { error: 'slotStart, name, and email are required' },
        { status: 400 }
      )
    }

    if (!process.env.CAL_EVENT_TYPE_ID && !process.env.CAL_EVENT_TYPE_SLUG) {
      return NextResponse.json(
        { error: 'Set CAL_EVENT_TYPE_ID or CAL_EVENT_TYPE_SLUG in environment variables' },
        { status: 500 }
      )
    }

    const base = process.env.CAL_API_BASE_URL || DEFAULT_CAL_API_BASE
    const endpoint = process.env.CAL_BOOK_ENDPOINT || `${base}/bookings`

    // Cal.com v2 bookings payload: start is ISO string, eventTypeId is number
    const payload: Record<string, unknown> = {
      start: slotStart,
      attendee: {
        name,
        email,
        timeZone,
      },
    }

    // Prefer eventTypeId; only use slug if id is absent
    if (process.env.CAL_EVENT_TYPE_ID) {
      payload.eventTypeId = Number(process.env.CAL_EVENT_TYPE_ID)
    } else if (process.env.CAL_EVENT_TYPE_SLUG) {
      payload.eventTypeSlug = process.env.CAL_EVENT_TYPE_SLUG
    }

    const calResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Required version header for Cal.com v2 bookings endpoint
        'cal-api-version': CAL_API_VERSION_BOOKINGS,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!calResponse.ok) {
      const errorText = await calResponse.text()
      return NextResponse.json(
        {
          error: 'Failed to create Cal.com booking',
          status: calResponse.status,
          details: errorText,
        },
        { status: calResponse.status }
      )
    }

    const calPayload = await calResponse.json()
    const booking = calPayload?.data || calPayload

    return NextResponse.json({
      booking: {
        bookingId: booking?.id || booking?.uid || null,
        bookingUrl: booking?.bookingUrl || booking?.url || process.env.CAL_BOOKING_PAGE_URL || null,
        status: booking?.status || 'confirmed',
      },
      raw: calPayload,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unexpected error while creating booking',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
