'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { clientDb } from '@/lib/firebase-admin'
import { formatNumber } from '@/lib/utils'

export function RealtimeTotalViews({ initialTotal = 0 }: { initialTotal?: number }) {
  const [total, setTotal] = useState(initialTotal)

  useEffect(() => {
    setTotal(initialTotal)
  }, [initialTotal])

  useEffect(() => {
    const unsub = onSnapshot(doc(clientDb, 'stats', 'admin'), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        if (typeof data.totalViews === 'number') {
          setTotal(data.totalViews)
        }
      }
    })
    return unsub
  }, [])

  return <>{formatNumber(total)}</>
}

export function RealtimeTotalUsage({ initialTotal = 0 }: { initialTotal?: number }) {
  const [total, setTotal] = useState(initialTotal)

  useEffect(() => {
    setTotal(initialTotal)
  }, [initialTotal])

  useEffect(() => {
    const unsub = onSnapshot(doc(clientDb, 'stats', 'admin'), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        if (typeof data.totalUsage === 'number') {
          setTotal(data.totalUsage)
        }
      }
    })
    return unsub
  }, [])

  return <>{formatNumber(total)}</>
}
