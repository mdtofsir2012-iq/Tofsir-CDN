import { adminDb } from '@/lib/firebase-admin'
import { deleteImageFromTelegram } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const userId = 'admin'

  const imagesSnap = await adminDb.collection("images").where("slug", "==", slug).where("userId", "==", userId).limit(1).get()
  if (imagesSnap.empty) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

  const imageDoc = imagesSnap.docs[0]
  const image = imageDoc.data() as any

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
