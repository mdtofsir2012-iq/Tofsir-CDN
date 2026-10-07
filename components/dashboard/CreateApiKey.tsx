'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateApiKeyButton() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'image' | 'video' | 'audio' | 'all'>('all')
  const [showInput, setShowInput] = useState(false)
  const router = useRouter()

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type }),
    })
    setLoading(false)
    setShowInput(false)
    setName('')
    setType('all')
    router.refresh()
  }

  if (showInput) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-[#111] border border-white/15 p-3 rounded-xl shadow-xl">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name e.g. Production"
          className="bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-white/30 transition-colors w-full sm:w-auto"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors w-full sm:w-auto"
        >
          <option value="all">⚡ Universal (All)</option>
          <option value="image">🖼️ Images Only</option>
          <option value="video">🎥 Videos Only</option>
          <option value="audio">🎵 Audio Only</option>
        </select>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Key'}
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="text-[#666] hover:text-white px-3 py-2 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      New API Key
    </button>
  )
}
