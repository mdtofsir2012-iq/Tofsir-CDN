import { adminDb } from '@/lib/firebase-admin'
import { getImageUrl } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const isDownload = searchParams.get('download') === 'true'

    const imagesSnap = await adminDb.collection("images").where("slug", "==", slug).limit(1).get()

    if (imagesSnap.empty) {
      return new NextResponse('Image not found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
    }

    const image = imagesSnap.docs[0].data() as any

    // Get fresh download URL from Telegram using the correct bot token for this file type
    const telegramUrl = await getImageUrl(image.telegramFileId, image.mimeType, image.fileName)

    // Fetch from Telegram and stream back
    const res = await fetch(telegramUrl)
    if (!res.ok) {
      const errText = await res.text()
      console.error('Failed to fetch image from Telegram:', errText)
      return new NextResponse('Failed to fetch image from Telegram', { status: 502, headers: { 'Content-Type': 'text/plain' } })
    }

    const dispositionType = isDownload ? 'attachment' : 'inline'
    let contentType = image.mimeType || 'image/jpeg'
    if (telegramUrl.toLowerCase().endsWith('.mp4') && contentType === 'image/gif') {
      contentType = 'video/mp4'
    }

    return new NextResponse(res.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `${dispositionType}; filename="${image.fileName}"`,
        ...(res.headers.get('content-length') ? { 'Content-Length': res.headers.get('content-length')! } : {}),
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (error: any) {
    console.error('Error serving image:', error)
    return new NextResponse(error.message || 'Internal server error', { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }
}
