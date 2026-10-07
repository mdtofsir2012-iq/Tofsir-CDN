import { adminDb } from '@/lib/firebase-admin'
import { uploadImageToTelegram } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { isValidImageFile } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const userId = 'admin'

    const keysSnap = await adminDb.collection("apiKeys").where("userId", "==", userId).limit(1).get()
    let apiKeyId = ''
    let keyDocRef = null
    let currentUsage = 0

    if (keysSnap.empty) {
      const newKeyRef = adminDb.collection("apiKeys").doc()
      await newKeyRef.set({
        id: newKeyRef.id,
        userId,
        key: `img_${nanoid(24)}`,
        name: 'Default Key',
        usageCount: 0,
        createdAt: new Date(),
      })
      apiKeyId = newKeyRef.id
      keyDocRef = newKeyRef
      currentUsage = 0
    } else {
      apiKeyId = keysSnap.docs[0].id
      keyDocRef = keysSnap.docs[0].ref
      currentUsage = (keysSnap.docs[0].data() as any)?.usageCount || 0
    }

    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!isValidImageFile(image)) return NextResponse.json({ error: 'Invalid file format' }, { status: 400 })
    if (image.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'Max 20MB file size exceeded' }, { status: 400 })

    const { file_id, message_id } = await uploadImageToTelegram(image)
    const slug = nanoid(12)
    const createdAt = new Date()

    const imageRef = adminDb.collection("images").doc()
    const imageData = {
      id: imageRef.id,
      userId,
      apiKeyId,
      telegramFileId: file_id,
      telegramMsgId: String(message_id),
      slug,
      fileName: image.name,
      fileSizeMb: parseFloat((image.size / 1024 / 1024).toFixed(2)),
      mimeType: image.type,
      createdAt,
    }

    await imageRef.set(imageData)

    if (keyDocRef) {
      await keyDocRef.update({
        usageCount: currentUsage + 1
      })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    return NextResponse.json({
      success: true,
      url: `${baseUrl}/i/${slug}`,
      id: slug,
      fileName: image.name,
      size: image.size,
    })
  } catch (error: any) {
    console.error('Dashboard upload API route error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error during upload' },
      { status: 500 }
    )
  }
}
