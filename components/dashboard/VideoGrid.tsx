'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VideoPlayer from './VideoPlayer'
import RealtimeViewCount from './RealtimeViewCount'
import { toast } from 'sonner'
import {
  Film, Play, MoreVertical, Trash2,
  CheckSquare, Square, Maximize2, Copy, Download,
  Check, X, CheckCircle2, Info
} from 'lucide-react'

type VideoItem = {
  id: string
  slug: string
  fileName: string
  fileSizeMb: number | null
  mimeType: string | null
  createdAt: string
  telegramMsgId: string | null
  views?: number
}

export default function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [viewingVideo, setViewingVideo] = useState<VideoItem | null>(null)
  const [viewingInfo, setViewingInfo] = useState<VideoItem | null>(null)
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

  async function handleDelete(slug: string) {
    setDeleting(slug)
    setActiveMenu(null)
    await fetch(`/api/images/${slug}`, { method: 'DELETE' })
    setDeleting(null)
    setSelectedSlugs(prev => prev.filter(s => s !== slug))
    toast.success('Video deleted successfully!')
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
    setSelectedSlugs(videos.map(v => v.slug))
    toast.success('All videos selected!')
  }

  function handleDeselectAll() {
    setSelectedSlugs([])
    toast.success('All videos deselected!')
  }

  async function handleDeleteAll() {
    if (selectedSlugs.length === 0) return
    if (!confirm(`Delete ${selectedSlugs.length} selected videos?`)) return

    setBulkDeleting(true)
    try {
      await Promise.all(
        selectedSlugs.map(slug => fetch(`/api/images/${slug}`, { method: 'DELETE' }))
      )
      toast.success(`Successfully deleted ${selectedSlugs.length} videos!`)
      setSelectedSlugs([])
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to delete some files')
    } finally {
      setBulkDeleting(false)
    }
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 bg-[#111] border border-white/[0.06] rounded-xl text-[#666] flex flex-col items-center">
        <Film className="w-12 h-12 mb-3 text-[#444]" />
        <p className="font-medium text-white text-sm">No videos uploaded yet</p>
        <p className="text-xs mt-1 text-[#555]">Upload MP4 videos above to stream them</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedSlugs.length > 0 && (
        <div className="bg-[#161616] border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>{selectedSlugs.length} video{selectedSlugs.length > 1 ? 's' : ''} selected</span>
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

      {/* Widescreen 16:9 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {videos.map((vid) => {
          const isSelected = selectedSlugs.includes(vid.slug)

          return (
            <div
              key={vid.id}
              className={`group relative bg-[#111] border rounded-xl flex flex-col transition-all ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              {/* Checkbox at Card Level (Top-Left) */}
              <div className="absolute top-3 left-3 z-40" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelect(vid.slug)}
                  className="w-4 h-4 rounded border-white/30 bg-black/80 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600 shadow-md"
                />
              </div>

              {/* 3-Dot Menu at Card Level (Top-Right) */}
              <div className="absolute top-2.5 right-2.5 z-50" ref={activeMenu === vid.slug ? menuRef : null} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveMenu(activeMenu === vid.slug ? null : vid.slug)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors shadow-xl ${
                    activeMenu === vid.slug ? 'bg-white text-black font-bold' : 'bg-black/70 text-white hover:bg-black/90'
                  }`}
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu (Opened Downwards) */}
                {activeMenu === vid.slug && (
                  <div className="absolute right-0 top-10 w-48 bg-[#161616] border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setActiveMenu(null)
                        setViewingInfo(vid)
                      }}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Info className="w-4 h-4 text-blue-400" /> File Info
                    </button>
                    <button
                      onClick={() => handleDelete(vid.slug)}
                      disabled={deleting === vid.slug}
                      className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      onClick={() => handleSelect(vid.slug)}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      {isSelected ? 'Deselect' : 'Select'}
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu(null)
                        setViewingVideo(vid)
                      }}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Play className="w-4 h-4" /> Play Video
                    </button>
                    <button
                      onClick={() => handleCopy(vid.slug)}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      {copied === vid.slug ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      Copy Link
                    </button>
                    <a
                      href={`/i/${vid.slug}?download=true`}
                      download
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors block font-medium"
                      onClick={() => setActiveMenu(null)}
                    >
                      <div className="flex items-center gap-2.5"><Download className="w-4 h-4" /> Download</div>
                    </a>
                  </div>
                )}
              </div>

              {/* Video Thumbnail (16:9) */}
              <div
                onClick={() => setViewingVideo(vid)}
                className="relative aspect-video bg-[#0a0a0a] rounded-t-xl overflow-hidden cursor-pointer group"
              >
                <video
                  src={`/i/${vid.slug}?thumbnail=true`}
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/[0.06] bg-[#0d0d0d] rounded-b-xl flex items-center justify-between">
                <p
                  className="text-xs text-white truncate font-medium cursor-pointer hover:text-blue-400 flex-1 pr-2"
                  onClick={() => setViewingVideo(vid)}
                  title={vid.fileName}
                >
                  {vid.fileName ? vid.fileName.replace(/\.[^/.]+$/, '') : ''}
                </p>
                <span className="text-[11px] text-[#666] flex items-center gap-0.5 shrink-0" title="Views">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <RealtimeViewCount docId={vid.id} collectionName="videos" initialViews={vid.views || 0} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {viewingVideo && (
        <VideoPlayer
          isOpen={!!viewingVideo}
          onClose={() => setViewingVideo(null)}
          videoUrl={`/i/${viewingVideo.slug}?fromDashboard=true`}
          fileName={viewingVideo.fileName}
          fileSizeMb={viewingVideo.fileSizeMb || undefined}
          createdAt={viewingVideo.createdAt}
          slug={viewingVideo.slug}
        />
      )}

      {viewingInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" /> File Information
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
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium shrink-0 flex items-center gap-1"
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
    </div>
  )
}
