import { adminDb } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = 'admin'

  const keyDocRef = adminDb.collection("apiKeys").doc(id)
  const keyDoc = await keyDocRef.get()

  if (!keyDoc.exists || keyDoc.data()?.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await keyDocRef.delete()

  revalidatePath('/dashboard/api-keys')
  revalidatePath('/dashboard')

  return NextResponse.json({ success: true })
}
