import { adminDb } from '@/lib/firebase-admin'
import { generateApiKey } from '@/lib/generate-key'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const userId = 'admin'

  const keysSnap = await adminDb.collection("apiKeys").where("userId", "==", userId).orderBy("createdAt", "desc").get()
  const keys = keysSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))

  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const { name, type } = await req.json()
  const userId = 'admin'

  const apiKeyRef = adminDb.collection("apiKeys").doc()
  const newKey = {
    id: apiKeyRef.id,
    userId,
    key: generateApiKey(),
    name: name || 'New Key',
    type: type || 'all',
    usageCount: 0,
    createdAt: new Date(),
  }

  await apiKeyRef.set(newKey)

  revalidatePath('/dashboard/api-keys')
  revalidatePath('/dashboard')

  return NextResponse.json(newKey)
}
