'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { clientDb } from '@/lib/firebase-admin'
import { formatNumber } from '@/lib/utils'

export default function RealtimeViewCount({
  docId,
  collectionName = 'images',
  initialViews = 0
}: {
  docId: string,
  collectionName?: string,
  initialViews?: number
}) {
  const [views, setViews] = useState(initialViews)

  useEffect(() => {
    setViews(initialViews)
  }, [initialViews])

  useEffect(() => {
    if (!docId || !collectionName) return
    const unsub = onSnapshot(doc(clientDb, collectionName, docId), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        if (typeof data.views === 'number') {
          setViews(data.views)
        }
      }
    })
    return unsub
  }, [docId, collectionName])

  return <>{formatNumber(views)}</>
}
