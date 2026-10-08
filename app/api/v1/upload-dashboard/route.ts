import { adminDb } from '@/lib/firebase-admin'
import { uploadImageToTelegram, getTelegramFilePath } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { isValidImageFile } from '@/lib/utils'
import { generateApiKey } from '@/lib/generate-key'
import { increment } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

// Required to allow Next.js to accept large files in Edge/Serverless APIs
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
    const userId = 'admin'

    // Ensure admin API key exists
    const keysSnap = await adminDb.collection("apiKeys").where("userId", "==", userId).limit(1).get()
    let apiKeyId = ''
    let keyDocRef: any = null
    let currentUsage = 0

    if (keysSnap.empty) {
      const newKey = generateApiKey()
      const keyRef = adminDb.collection("apiKeys").doc()
      await keyRef.set({
        id: keyRef.id,
        userId,
        name: 'Default Dashboard Key',
        key: newKey,
        type: 'all',
        defaultLang: 'curl',
        usageCount: 0,
        totalViews: 0,
        createdAt: new Date()
      })
      apiKeyId = keyRef.id
      keyDocRef = keyRef
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

    const mime = image.type || ''
    const name = image.name.toLowerCase()
    const isAudio = mime.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => name.endsWith(ext))
    const isVideo = mime === 'video/mp4' || name.endsWith('.mp4')
    const fileCategory = isAudio ? 'audio' : isVideo ? 'video' : 'image'
    const collectionName = isAudio ? 'audios' : isVideo ? 'videos' : 'images'

    const { file_id, message_id } = await uploadImageToTelegram(image)
    let telegramFilePath = ''
    try {
      telegramFilePath = await getTelegramFilePath(file_id, fileCategory)
    } catch (e) {}

    const slug = nanoid(12)
    const createdAt = new Date()

    const imageRef = adminDb.collection(collectionName).doc()
    const imageData = {
      id: imageRef.id,
      userId,
      apiKeyId,
      telegramFileId: file_id,
      telegramMsgId: String(message_id),
      telegramFilePath,
      slug,
      fileName: image.name,
      fileSizeMb: parseFloat((image.size / 1024 / 1024).toFixed(2)),
      mimeType: image.type,
      createdAt,
      views: 0
    }

    await imageRef.set(imageData)

    if (keyDocRef) {
      await keyDocRef.update({
        usageCount: currentUsage + 1
      })
      await adminDb.collection("stats").doc("admin").set({
        totalUsage: increment(1)
      }, { merge: true })
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
