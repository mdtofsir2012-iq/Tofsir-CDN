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

  const [imgSnap, vidSnap, audSnap] = await Promise.all([
    adminDb.collection("images").where("userId", "==", userId).get(),
    adminDb.collection("videos").where("userId", "==", userId).get(),
    adminDb.collection("audios").where("userId", "==", userId).get(),
  ])

  const allMedia = [
    ...imgSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })),
    ...vidSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })),
    ...audSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })),
  ]

  allMedia.sort((a, b) => {
    const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime()
    const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime()
    return tB - tA
  })

  let totalSizeMb = 0
  allMedia.forEach((img: any) => {
    if (typeof img.fileSizeMb === 'number') {
      totalSizeMb += img.fileSizeMb
    }
  })

  const user = userData ? {
    ...userData,
    apiKeys,
    images: allMedia.slice(0, 8),
    _count: { images: allMedia.length }
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
      totalViews: data.totalViews,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toString() : String(data.createdAt),
      rawCreatedAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : new Date(data.createdAt || 0).getTime()
    }
  })
  apiKeys.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt)
  return apiKeys
}

export const getImagesData = async (userId: string) => {
  const snap = await adminDb.collection("images").where("userId", "==", userId).get()
  const items = snap.docs.map(doc => {
    const img = doc.data() as any
    return {
      id: doc.id,
      slug: img.slug,
      fileName: img.fileName,
      fileSizeMb: img.fileSizeMb,
      mimeType: img.mimeType,
      views: img.views,
      createdAt: img.createdAt?.toDate ? img.createdAt.toDate().toString() : String(img.createdAt),
      rawCreatedAt: img.createdAt?.toDate ? img.createdAt.toDate().getTime() : new Date(img.createdAt || 0).getTime(),
      telegramMsgId: img.telegramMsgId != null ? String(img.telegramMsgId) : null,
    }
  })
  items.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt)
  return items
}

export const getVideosData = async (userId: string) => {
  const snap = await adminDb.collection("videos").where("userId", "==", userId).get()
  const items = snap.docs.map(doc => {
    const img = doc.data() as any
    return {
      id: doc.id,
      slug: img.slug,
      fileName: img.fileName,
      fileSizeMb: img.fileSizeMb,
      mimeType: img.mimeType,
      views: img.views,
      createdAt: img.createdAt?.toDate ? img.createdAt.toDate().toString() : String(img.createdAt),
      rawCreatedAt: img.createdAt?.toDate ? img.createdAt.toDate().getTime() : new Date(img.createdAt || 0).getTime(),
      telegramMsgId: img.telegramMsgId != null ? String(img.telegramMsgId) : null,
    }
  })
  items.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt)
  return items
}

export const getAudiosData = async (userId: string) => {
  const snap = await adminDb.collection("audios").where("userId", "==", userId).get()
  const items = snap.docs.map(doc => {
    const img = doc.data() as any
    return {
      id: doc.id,
      slug: img.slug,
      fileName: img.fileName,
      fileSizeMb: img.fileSizeMb,
      mimeType: img.mimeType,
      views: img.views,
      createdAt: img.createdAt?.toDate ? img.createdAt.toDate().toString() : String(img.createdAt),
      rawCreatedAt: img.createdAt?.toDate ? img.createdAt.toDate().getTime() : new Date(img.createdAt || 0).getTime(),
      telegramMsgId: img.telegramMsgId != null ? String(img.telegramMsgId) : null,
    }
  })
  items.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt)
  return items
}
