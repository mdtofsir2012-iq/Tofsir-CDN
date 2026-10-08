import { adminDb, findMediaBySlug } from '@/lib/firebase-admin'
import { deleteImageFromTelegram } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const userId = 'admin'

  const mediaResult = await findMediaBySlug(slug)
  if (!mediaResult) return NextResponse.json({ error: 'Media not found' }, { status: 404 })

  const imageDoc = mediaResult.doc
  const image = imageDoc.data() as any

  if (image.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (image.telegramMsgId) {
    try {
      await Promise.race([
        deleteImageFromTelegram(Number(image.telegramMsgId)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
      ])
    } catch (e) {
      console.warn('Telegram delete skipped/timed out, deleting from DB instantly:', e)
    }
  }

  await imageDoc.ref.delete()

  return NextResponse.json({ success: true })
}
