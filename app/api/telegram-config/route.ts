import { adminDb } from '@/lib/firebase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const doc = await adminDb.collection('settings').doc('telegram').get()
    if (doc.exists) {
      return NextResponse.json(doc.data())
    }
    return NextResponse.json({
      imageBotToken: '',
      imageChannelId: '',
      videoBotToken: '',
      videoChannelId: '',
      audioBotToken: '',
      audioChannelId: '',
      botToken: '',
      channelId: ''
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch telegram config' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    await adminDb.collection('settings').doc('telegram').set({
      imageBotToken: data.imageBotToken?.trim() || '',
      imageChannelId: data.imageChannelId?.trim() || '',
      videoBotToken: data.videoBotToken?.trim() || '',
      videoChannelId: data.videoChannelId?.trim() || '',
      audioBotToken: data.audioBotToken?.trim() || '',
      audioChannelId: data.audioChannelId?.trim() || '',
      botToken: data.botToken?.trim() || '',
      channelId: data.channelId?.trim() || '',
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save telegram config' }, { status: 500 })
  }
}
