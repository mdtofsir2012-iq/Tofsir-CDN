import { adminDb } from '@/lib/firebase-admin'
import { uploadImageToTelegram } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { corsHeaders, handleOptions } from './cors'
import { isValidImageFile } from '@/lib/utils'

export async function OPTIONS() {
  return handleOptions()
}

export const dynamic = 'force-dynamic'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  try {
    const rawKey = req.headers.get('x-api-key') || ''
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, '')
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401, headers: corsHeaders() })
    }

    const keysSnap = await adminDb.collection("apiKeys").where("key", "==", apiKey).limit(1).get()
    if (keysSnap.empty) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: corsHeaders() })
    }

    const keyDoc = keysSnap.docs[0]
    const keyRecord = { id: keyDoc.id, ...(keyDoc.data() as any) }

    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No file provided. Send file as multipart/form-data with key "image"' }, { status: 400, headers: corsHeaders() })
    }

    const mime = image.type || ''
    const name = image.name.toLowerCase()
    const isAudio = mime.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => name.endsWith(ext))
    const isVideo = mime === 'video/mp4' || name.endsWith('.mp4')
    const fileCategory = isAudio ? 'audio' : isVideo ? 'video' : 'image'

    const keyType = keyRecord.type || 'all'
    if (keyType !== 'all' && keyType !== fileCategory) {
      return NextResponse.json({
        error: `API Key type mismatch. This API key is authorized for '${keyType}' uploads only, but you attempted to upload a '${fileCategory}' file.`
      }, { status: 403, headers: corsHeaders() })
    }

    if (!isValidImageFile(image)) {
      return NextResponse.json({
        error: `Invalid file type. Allowed formats: Images, MP4, MP3, WAV, OGG, M4A, AAC`
      }, { status: 400, headers: corsHeaders() })
    }

    if (image.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 20MB.' }, { status: 400, headers: corsHeaders() })
    }

    const { file_id, message_id } = await uploadImageToTelegram(image)
    const slug = nanoid(12)
    const createdAt = new Date()

    const imageRef = adminDb.collection("images").doc()
    const imageData = {
      id: imageRef.id,
      userId: keyRecord.userId,
      apiKeyId: keyRecord.id,
      telegramFileId: file_id,
      telegramMsgId: String(message_id),
      slug,
      fileName: image.name,
      fileSizeMb: parseFloat((image.size / 1024 / 1024).toFixed(2)),
      mimeType: image.type,
      createdAt,
    }

    await imageRef.set(imageData)

    try {
      const currentCount = (keyDoc.data() as any)?.usageCount || 0
      await keyDoc.ref.update({
        usageCount: currentCount + 1
      })
    } catch (e) {
      console.error('Failed to update usage count:', e)
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    return NextResponse.json({
      success: true,
      id: slug,
      url: `${baseUrl}/i/${slug}`,
      fileName: image.name,
      size: image.size,
      type: image.type,
      uploadedAt: createdAt,
    }, { headers: corsHeaders() })
  } catch (error: any) {
    console.error('API Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error during upload' },
      { status: 500, headers: corsHeaders() }
    )
  }
}
