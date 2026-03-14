import { NextRequest, NextResponse } from 'next/server'

type InterviewSlot = {
  start: string
  end: string
  bookingUrl?: string
}

const DEFAULT_CAL_API_BASE = 'https://api.cal.com/v2'
const DEFAULT_SLOT_DURATION_MINUTES = 30
const CAL_API_VERSION_SLOTS = '2024-08-13' // Updated to the stable V2 version

const toIsoString = (value: unknown): string | null => {
  if (!value) return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const normalizeSlots = (payload: any): InterviewSlot[] => {
  // Cal.com v2 structure: data.slots["2026-03-15"] = [{time: "...", ...}]
  const slotsData = payload?.data?.slots || payload?.slots
  if (!slotsData) return []

  const normalized: InterviewSlot[] = []

  // Handle the object-based date keys (V2 style)
  if (typeof slotsData === 'object' && !Array.isArray(slotsData)) {
    for (const dateKey in slotsData) {
      const daySlots = slotsData[dateKey]
      if (Array.isArray(daySlots)) {
        daySlots.forEach((slot: any) => {
          const start = toIsoString(slot.time || slot.start)
          if (start) {
            normalized.push({
              start,
              end: toIsoString(slot.end) || new Date(new Date(start).getTime() + DEFAULT_SLOT_DURATION_MINUTES * 60000).toISOString(),
              bookingUrl: slot.bookingUrl
            })
          }
        })
      }
    }
  }

  return normalized.sort((a, b) => a.start.localeCompare(b.start))
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.CAL_API_KEY
    const eventTypeId = process.env.CAL_EVENT_TYPE_ID

    if (!apiKey || !eventTypeId) {
      return NextResponse.json({ error: 'Missing CAL_API_KEY or CAL_EVENT_TYPE_ID' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    
    // Normalize parameters
    const startTime = searchParams.get('start') || new Date().toISOString()
    const days = parseInt(searchParams.get('days') || '14')
    const endTime = searchParams.get('end') || new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    
    // Cal.com uses 'Asia/Kolkata' usually; your log shows 'Asia/Calcutta'
    // We pass what the frontend sends, but default to UTC
    const timeZone = searchParams.get('timeZone') || 'UTC'

    const base = process.env.CAL_API_BASE_URL || DEFAULT_CAL_API_BASE
    const calUrl = new URL(`${base}/slots/available`)
    
    calUrl.searchParams.set('eventTypeId', eventTypeId)
    calUrl.searchParams.set('startTime', startTime)
    calUrl.searchParams.set('endTime', endTime)
    calUrl.searchParams.set('timeZone', timeZone)

    const calResponse = await fetch(calUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'cal-api-version': CAL_API_VERSION_SLOTS,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } // Ensure fresh data
    })

    const calPayload = await calResponse.json()

    if (!calResponse.ok) {
      return NextResponse.json({ 
        error: 'Cal.com API error', 
        details: calPayload 
      }, { status: calResponse.status })
    }

    const slots = normalizeSlots(calPayload)

    return NextResponse.json({
      slots,
      bookingLink: process.env.CAL_BOOKING_PAGE_URL || `https://cal.com/${process.env.CAL_USERNAME}/kimun-2026`
    })

  } catch (error: any) {
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 })
  }
}