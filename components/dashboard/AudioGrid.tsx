'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AudioPlayer from './AudioPlayer'
import RealtimeViewCount from './RealtimeViewCount'
import { toast } from 'sonner'
import {
  Music, Play, MoreVertical, Trash2,
  CheckSquare, Square, Copy, Download,
  Check, X, CheckCircle2, Info
} from 'lucide-react'

type AudioItem = {
  id: string
  slug: string
  fileName: string
  fileSizeMb: number | null
  mimeType: string | null
  createdAt: string
  telegramMsgId: string | null
  views?: number
}

export default function AudioGrid({ audios }: { audios: AudioItem[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [viewingAudio, setViewingAudio] = useState<AudioItem | null>(null)
  const [viewingInfo, setViewingInfo] = useState<AudioItem | null>(null)
  const [fileToDelete, setFileToDelete] = useState<AudioItem | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function confirmDelete(slug: string) {
    setDeleting(slug)
    try {
      const res = await fetch(`/api/images/${slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Audio deleted successfully!')
      setSelectedSlugs(prev => prev.filter(s => s !== slug))
      router.refresh()
    } catch (e) {
      toast.error('Failed to delete audio')
    } finally {
      setDeleting(null)
      setFileToDelete(null)
    }
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
    if (!confirm(`Are you sure you want to delete ${selectedSlugs.length} selected audio files? This will remove them from storage and Telegram.`)) return

    setBulkDeleting(true)
    try {
      await Promise.all(
        selectedSlugs.map(slug => fetch(`/api/images/${slug}`, { method: 'DELETE' }))
      )
      toast.success(`Successfully deleted ${selectedSlugs.length} audio files!`)
      setSelectedSlugs([])
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to delete some files')
    } finally {
      setBulkDeleting(false)
    }
  }

  if (audios.length === 0) {
    return (
      <div className="text-center py-16 bg-[#111] border border-white/[0.06] rounded-xl text-[#666] flex flex-col items-center">
        <Music className="w-12 h-12 mb-3 text-[#444]" />
        <p className="font-medium text-white text-sm">No audio files uploaded yet</p>
        <p className="text-xs mt-1 text-[#555]">Upload audio files above to stream them</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedSlugs.length > 0 && (
        <div className="bg-[#161616] border border-purple-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
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
              className={`group relative bg-[#111] border rounded-xl flex flex-col transition-all ${
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
                      onClick={() => {
                        setActiveMenu(null)
                        setViewingInfo(audio)
                      }}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Info className="w-4 h-4 text-purple-400" /> File Info
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu(null)
                        setFileToDelete(audio)
                      }}
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
              <div className="p-2.5 border-t border-white/[0.06] bg-[#0d0d0d] rounded-b-xl flex items-center justify-between">
                <p
                  className="text-xs text-white truncate font-medium cursor-pointer hover:text-purple-400 flex-1 pr-2"
                  onClick={() => setViewingAudio(audio)}
                  title={audio.fileName}
                >
                  {audio.fileName ? audio.fileName.replace(/\.[^/.]+$/, '') : ''}
                </p>
                <span className="text-[11px] text-[#666] flex items-center gap-0.5 shrink-0" title="Views">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <RealtimeViewCount docId={audio.id} collectionName="audios" initialViews={audio.views || 0} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {viewingAudio && (
        <AudioPlayer
          isOpen={!!viewingAudio}
          onClose={() => setViewingAudio(null)}
          audioUrl={`/i/${viewingAudio.slug}?fromDashboard=true`}
          fileName={viewingAudio.fileName}
          fileSizeMb={viewingAudio.fileSizeMb || undefined}
          createdAt={viewingAudio.createdAt}
          slug={viewingAudio.slug}
        />
      )}

      {viewingInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" /> File Information
              </h3>
              <button
                onClick={() => setViewingInfo(null)}
                className="text-[#888] hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-3 space-y-2">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#777]">File Name</span>
                  <span className="text-white font-medium truncate max-w-[200px]" title={viewingInfo.fileName}>{viewingInfo.fileName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#777]">File Size</span>
                  <span className="text-white font-medium">{viewingInfo.fileSizeMb ? `${viewingInfo.fileSizeMb} MB` : 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#777]">MIME Type</span>
                  <span className="text-white font-medium">{viewingInfo.mimeType || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#777]">Total Views</span>
                  <span className="text-white font-medium">{viewingInfo.views || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#777]">Uploaded At</span>
                  <span className="text-white font-medium">{new Date(viewingInfo.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#777]">Telegram Msg ID</span>
                  <span className="text-white font-mono">{viewingInfo.telegramMsgId || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#777]">Direct URL</label>
                <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/i/${viewingInfo.slug}`}
                    className="bg-transparent text-xs font-mono text-[#aaa] w-full outline-none select-all"
                  />
                  <button
                    onClick={() => handleCopy(viewingInfo.slug)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium shrink-0 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingInfo(null)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {fileToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-white">Delete Audio?</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              Are you sure you want to delete <span className="text-white font-medium truncate inline-block max-w-[200px] align-bottom" title={fileToDelete.fileName}>"{fileToDelete.fileName}"</span>? This will permanently remove the audio from storage and Telegram.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="text-xs text-[#888] hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(fileToDelete.slug)}
                disabled={deleting === fileToDelete.slug}
                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {deleting === fileToDelete.slug ? 'Deleting...' : 'Delete Audio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
