import { adminDb, findMediaBySlug } from '@/lib/firebase-admin'
import { getImageUrl } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { increment } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const isDownload = searchParams.get('download') === 'true'
    const isPreview = searchParams.get('thumbnail') === 'true'

    const mediaResult = await findMediaBySlug(slug)

    if (!mediaResult) {
      return new NextResponse('Media not found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
    }

    const imageDoc = mediaResult.doc
    const image = imageDoc.data() as any

    const isPartial = req.headers.has('range')
    const isFromDashboard = searchParams.get('fromDashboard') === 'true'
    const isVideoOrAudio = image.mimeType?.startsWith('video/') || image.mimeType?.startsWith('audio/') || image.fileName?.toLowerCase().match(/\.(mp4|mp3|wav|ogg|m4a|aac)$/)

    if (!isPreview && !isPartial && !isFromDashboard && !isVideoOrAudio) {
      // Increment view count on the media
      imageDoc.ref.update({
        views: increment(1)
      }).catch(console.error)

      // Increment global admin views stats
      adminDb.collection("stats").doc("admin").set({
        totalViews: increment(1)
      }, { merge: true }).catch(console.error)

      // Increment total views on the associated API Key
      if (image.apiKeyId) {
        adminDb.collection("apiKeys").doc(image.apiKeyId).update({
          totalViews: increment(1)
        }).catch(console.error)
      }
    }

    const telegramUrl = await getImageUrl(image.telegramFileId, image.mimeType, image.fileName, imageDoc.ref, image.telegramFilePath)

    const fetchHeaders: Record<string, string> = {}
    const rangeHeader = req.headers.get('range')
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader
    }

    const res = await fetch(telegramUrl, { headers: fetchHeaders })
    if (!res.ok && res.status !== 206) {
      const errText = await res.text().catch(() => '')
      console.error('Failed to fetch media from Telegram:', res.status, errText)
      return new NextResponse('Failed to fetch media from Telegram', { status: 502, headers: { 'Content-Type': 'text/plain' } })
    }

    const dispositionType = isDownload ? 'attachment' : 'inline'
    let contentType = image.mimeType || 'image/jpeg'
    if (telegramUrl.toLowerCase().endsWith('.mp4') && contentType === 'image/gif') {
      contentType = 'video/mp4'
    }

    const sanitizedFileName = encodeURIComponent(image.fileName || 'file')

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `${dispositionType}; filename*=UTF-8''${sanitizedFileName}`,
      'Accept-Ranges': 'bytes',
    }

    if (res.headers.get('content-length')) {
      responseHeaders['Content-Length'] = res.headers.get('content-length')!
    }
    if (res.headers.get('content-range')) {
      responseHeaders['Content-Range'] = res.headers.get('content-range')!
    }

    return new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error('Error serving media:', error)
    return new NextResponse(error.message || 'Internal server error', { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }
}
