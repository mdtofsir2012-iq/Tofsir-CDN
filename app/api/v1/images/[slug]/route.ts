import { adminDb } from '@/lib/firebase-admin'
import { deleteImageFromTelegram } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '../../upload/cors'

export async function OPTIONS() {
  return handleOptions()
}

export const dynamic = 'force-dynamic'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const rawKey = req.headers.get('x-api-key') || ''
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '')

  if (!apiKey) return NextResponse.json({ error: 'Missing x-api-key' }, { status: 401, headers: corsHeaders() })

  const keysSnap = await adminDb.collection("apiKeys").where("key", "==", apiKey).limit(1).get()
  if (keysSnap.empty) return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: corsHeaders() })

  const keyDoc = keysSnap.docs[0]
  const apiKeyId = keyDoc.id

  const imagesSnap = await adminDb.collection("images").where("slug", "==", slug).where("apiKeyId", "==", apiKeyId).limit(1).get()
  if (imagesSnap.empty) return NextResponse.json({ error: 'Image not found' }, { status: 404, headers: corsHeaders() })

  const imageDoc = imagesSnap.docs[0]
  const image = imageDoc.data() as any

  if (image.telegramMsgId) {
    try {
      await deleteImageFromTelegram(Number(image.telegramMsgId))
    } catch (e) {
      console.error('Telegram deletion failed:', e)
    }
  }

  await imageDoc.ref.delete()

  return NextResponse.json({ success: true }, { headers: corsHeaders() })
}
