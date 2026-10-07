import { adminDb } from '@/lib/firebase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json()

    if (!pin) {
      return NextResponse.json({ success: false, error: 'PIN is required' }, { status: 400 })
    }

    const doc = await adminDb.collection('settings').doc('security').get()

    // Completely removed the hardcoded '201213'
    let validPin = process.env.DEFAULT_DASHBOARD_PIN

    if (doc.exists) {
      const data = doc.data()
      if (data?.dashboardPin) {
        validPin = data.dashboardPin
      }
    } else if (validPin) {
      // Create the document with .env pin if it doesn't exist in Firestore
      await adminDb.collection('settings').doc('security').set({ dashboardPin: validPin })
    }

    if (!validPin) {
      console.error('Security Error: Dashboard PIN is not set in Firestore or .env')
      return NextResponse.json({ success: false, error: 'System error: PIN is not configured by admin.' }, { status: 500 })
    }

    if (pin === validPin) {
      const cookieStore = await cookies()
      cookieStore.set('dashboard_access', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Incorrect PIN. Try again.' }, { status: 401 })
  } catch (error: any) {
    console.error('Verify PIN error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
