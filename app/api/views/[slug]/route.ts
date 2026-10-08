import { adminDb, findMediaBySlug } from '@/lib/firebase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { increment } from 'firebase/firestore'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const mediaResult = await findMediaBySlug(slug)

    if (!mediaResult) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const imageDoc = mediaResult.doc
    const image = imageDoc.data() as any

    await imageDoc.ref.update({
      views: increment(1)
    })

    // Increment global admin views stats
    await adminDb.collection("stats").doc("admin").set({
      totalViews: increment(1)
    }, { merge: true })

    if (image.apiKeyId) {
      await adminDb.collection("apiKeys").doc(image.apiKeyId).update({
        totalViews: increment(1)
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error incrementing view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
