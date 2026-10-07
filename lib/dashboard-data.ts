import { adminDb } from '@/lib/firebase-admin'

export const getDashboardData = async (userId: string) => {
  const userDoc = await adminDb.collection("users").doc(userId).get()
  const userData = userDoc.exists ? { id: userDoc.id, ...(userDoc.data() as any) } : null

  const keysSnap = await adminDb.collection("apiKeys").where("userId", "==", userId).get()
  const apiKeys = keysSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))
  apiKeys.sort((a, b) => {
    const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime()
    const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime()
    return tB - tA
  })

  const imagesSnap = await adminDb.collection("images").where("userId", "==", userId).get()
  const images = imagesSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))
  images.sort((a, b) => {
    const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime()
    const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime()
    return tB - tA
  })

  let totalSizeMb = 0
  images.forEach((img: any) => {
    if (typeof img.fileSizeMb === 'number') {
      totalSizeMb += img.fileSizeMb
    }
  })

  const user = userData ? {
    ...userData,
    apiKeys,
    images: images.slice(0, 8),
    _count: { images: images.length }
  } : null

  return { user, _sum: { fileSizeMb: totalSizeMb } }
}

export const getApiKeysData = async (userId: string) => {
  const keysSnap = await adminDb.collection("apiKeys").where("userId", "==", userId).get()
  const apiKeys = keysSnap.docs.map(doc => {
    const data = doc.data() as any
    return {
      id: doc.id,
      key: data.key,
      name: data.name,
      type: data.type || 'all',
      defaultLang: data.defaultLang || 'curl',
      usageCount: data.usageCount,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toString() : String(data.createdAt),
      rawCreatedAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : new Date(data.createdAt || 0).getTime()
    }
  })
  apiKeys.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt)
  return apiKeys
}

export const getImagesData = async (userId: string) => {
  const imagesSnap = await adminDb.collection("images").where("userId", "==", userId).get()
  const images = imagesSnap.docs.map(doc => {
    const img = doc.data() as any
    return {
      id: doc.id,
      slug: img.slug,
      fileName: img.fileName,
      fileSizeMb: img.fileSizeMb,
      mimeType: img.mimeType,
      createdAt: img.createdAt?.toDate ? img.createdAt.toDate().toString() : String(img.createdAt),
      rawCreatedAt: img.createdAt?.toDate ? img.createdAt.toDate().getTime() : new Date(img.createdAt || 0).getTime(),
      telegramMsgId: img.telegramMsgId != null ? String(img.telegramMsgId) : null,
    }
  })
  images.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt)
  return images
}
