'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AudioPlayer from './AudioPlayer'
import { toast } from 'sonner'
import {
  Music, Play, MoreVertical, Trash2,
  CheckSquare, Square, Copy, Download,
  Check, X, CheckCircle2
} from 'lucide-react'

type AudioItem = {
  id: string
  slug: string
  fileName: string
  fileSizeMb: number | null
  mimeType: string | null
  createdAt: string
  telegramMsgId: string | null
}

export default function AudioGrid({ audios }: { audios: AudioItem[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [viewingAudio, setViewingAudio] = useState<AudioItem | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleDelete(slug: string) {
    if (!confirm('Delete this audio file?')) return
    setDeleting(slug)
    setActiveMenu(null)
    await fetch(`/api/images/${slug}`, { method: 'DELETE' })
    setDeleting(null)
    setSelectedSlugs(prev => prev.filter(s => s !== slug))
    toast.success('Audio deleted successfully!')
    router.refresh()
  }

  async function handleCopy(slug: string) {
    const url = `${window.location.origin}/i/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(slug)
    setActiveMenu(null)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
  }

  function handleSelect(slug: string) {
    setActiveMenu(null)
    setSelectedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  function handleSelectAll() {
    setSelectedSlugs(audios.map(a => a.slug))
    toast.success('All audio files selected!')
  }

  function handleDeselectAll() {
    setSelectedSlugs([])
    toast.success('All audio files deselected!')
  }

  async function handleDeleteAll() {
    if (selectedSlugs.length === 0) return
    if (!confirm(`Delete ${selectedSlugs.length} selected audio files?`)) return

    setBulkDeleting(true)
    try {
      await Promise.all(
        selectedSlugs.map(slug => fetch(`/api/images/${slug}`, { method: 'DELETE' }))
      )
      toast.success(`Successfully deleted ${selectedSlugs.length} audio files!`)
      setSelectedSlugs([])
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to delete some audio files')
    } finally {
      setBulkDeleting(false)
    }
  }

  if (audios.length === 0) {
    return (
      <div className="text-center py-16 bg-[#111] border border-white/[0.06] rounded-xl text-[#666] flex flex-col items-center">
        <Music className="w-12 h-12 mb-3 text-[#444]" />
        <p className="font-medium text-white text-sm">No audio uploaded yet</p>
        <p className="text-xs mt-1 text-[#555]">Upload MP3, WAV, OGG, M4A, AAC files above</p>
      </div>
    )
  }

  const isAllSelected = selectedSlugs.length === audios.length && audios.length > 0

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedSlugs.length > 0 && (
        <div className="bg-[#161616] border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>{selectedSlugs.length} audio{selectedSlugs.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSelectAll}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-lg transition-colors font-medium flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="bg-white/5 hover:bg-white/10 text-[#aaa] hover:text-white text-xs px-3.5 py-2 rounded-lg transition-colors font-medium flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Deselect All
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={bulkDeleting}
              className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white text-xs px-3.5 py-2 rounded-lg transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {bulkDeleting ? 'Deleting...' : `Delete All (${selectedSlugs.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {audios.map((audio) => {
          const isSelected = selectedSlugs.includes(audio.slug)

          return (
            <div
              key={audio.id}
              className={`group relative bg-[#111] border rounded-xl overflow-hidden flex flex-col transition-all ${
                isSelected ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg' : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              {/* Checkbox Overlay */}
              <div className="absolute top-2.5 left-2.5 z-40" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelect(audio.slug)}
                  className="w-4 h-4 rounded border-white/30 bg-black/80 text-purple-600 focus:ring-0 cursor-pointer accent-purple-600 shadow-md"
                />
              </div>

              {/* 3-Dot Menu Button */}
              <div className="absolute top-2 right-2 z-50" ref={activeMenu === audio.slug ? menuRef : null} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveMenu(activeMenu === audio.slug ? null : audio.slug)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors shadow-xl ${
                    activeMenu === audio.slug ? 'bg-white text-black font-bold' : 'bg-black/70 text-white hover:bg-black/90'
                  }`}
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {activeMenu === audio.slug && (
                  <div className="absolute right-0 top-10 w-48 bg-[#161616] border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => handleDelete(audio.slug)}
                      disabled={deleting === audio.slug}
                      className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      onClick={() => handleSelect(audio.slug)}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      {isSelected ? 'Deselect' : 'Select'}
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu(null)
                        setViewingAudio(audio)
                      }}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Play className="w-4 h-4" /> Play Audio
                    </button>
                    <button
                      onClick={() => handleCopy(audio.slug)}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      {copied === audio.slug ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      Copy Link
                    </button>
                    <a
                      href={`/i/${audio.slug}?download=true`}
                      download
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors block font-medium"
                      onClick={() => setActiveMenu(null)}
                    >
                      <div className="flex items-center gap-2.5"><Download className="w-4 h-4" /> Download</div>
                    </a>
                  </div>
                )}
              </div>

              {/* Audio Container */}
              <div
                onClick={() => setViewingAudio(audio)}
                className="relative aspect-square bg-[#0a0a0a] rounded-t-xl overflow-hidden flex flex-col items-center justify-center p-4 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-purple-600/20 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-inner group-hover:bg-purple-600/40 group-hover:scale-110 transition-all duration-300">
                  <Play className="w-6 h-6 ml-1 fill-current opacity-0 group-hover:opacity-100 absolute transition-opacity" />
                  <Music className="w-7 h-7 group-hover:opacity-0 transition-opacity" />
                </div>
                <p className="text-[11px] text-[#aaa] font-medium text-center truncate w-full px-2">
                  Click to play
                </p>
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-white/[0.06] bg-[#0d0d0d] rounded-b-xl space-y-1">
                <p
                  className="text-xs text-white truncate font-medium cursor-pointer hover:text-purple-400"
                  onClick={() => setViewingAudio(audio)}
                  title={audio.fileName}
                >
                  {audio.fileName}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#666]">
                  <span>{audio.fileSizeMb ? `${audio.fileSizeMb} MB` : 'Audio'}</span>
                  <button
                    onClick={() => handleCopy(audio.slug)}
                    className="text-purple-400 hover:text-purple-300 transition-colors font-mono"
                  >
                    {copied === audio.slug ? 'Copied' : `/i/${audio.slug}`}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {viewingAudio && (
        <AudioPlayer
          isOpen={!!viewingAudio}
          onClose={() => setViewingAudio(null)}
          audioUrl={`/i/${viewingAudio.slug}`}
          fileName={viewingAudio.fileName}
          fileSizeMb={viewingAudio.fileSizeMb || undefined}
          createdAt={viewingAudio.createdAt}
          slug={viewingAudio.slug}
        />
      )}
    </div>
  )
}
