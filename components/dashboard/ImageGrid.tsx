'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageViewer from './ImageViewer'
import AudioPlayer from './AudioPlayer'
import RealtimeViewCount from './RealtimeViewCount'
import { toast } from 'sonner'
import {
  FolderOpen, Music, Play, MoreVertical, Trash2,
  CheckSquare, Square, Maximize2, Copy, Download,
  Check, X, CheckCircle2, Info
} from 'lucide-react'

type ImageItem = {
  id: string
  slug: string
  fileName: string
  fileSizeMb: number | null
  mimeType: string | null
  createdAt: string
  telegramMsgId: string | null
  views?: number
}

export default function ImageGrid({ images }: { images: ImageItem[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [viewingImage, setViewingImage] = useState<ImageItem | null>(null)
  const [viewingAudio, setViewingAudio] = useState<ImageItem | null>(null)
  const [viewingInfo, setViewingInfo] = useState<ImageItem | null>(null)
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
    toast.success('File deleted successfully!')
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
    setSelectedSlugs(images.map(img => img.slug))
    toast.success('All files selected!')
  }

  function handleDeselectAll() {
    setSelectedSlugs([])
    toast.success('All files deselected!')
  }

  async function handleDeleteAll() {
    if (selectedSlugs.length === 0) return
    if (!confirm(`Delete ${selectedSlugs.length} selected files?`)) return

    setBulkDeleting(true)
    try {
      await Promise.all(
        selectedSlugs.map(slug => fetch(`/api/images/${slug}`, { method: 'DELETE' }))
      )
      toast.success(`Successfully deleted ${selectedSlugs.length} files!`)
      setSelectedSlugs([])
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to delete some files')
    } finally {
      setBulkDeleting(false)
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-16 bg-[#111] border border-white/[0.06] rounded-xl text-[#666] flex flex-col items-center">
        <FolderOpen className="w-12 h-12 mb-3 text-[#444]" />
        <p className="font-medium text-white text-sm">No items uploaded yet</p>
        <p className="text-xs mt-1 text-[#555]">Upload files above to get a custom URL</p>
      </div>
    )
  }

  const isAllSelected = selectedSlugs.length === images.length && images.length > 0

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedSlugs.length > 0 && (
        <div className="bg-[#161616] border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>{selectedSlugs.length} item{selectedSlugs.length > 1 ? 's' : ''} selected</span>
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
        {images.map((img) => {
          const isVideo = img.mimeType === 'video/mp4' || img.fileName?.toLowerCase().endsWith('.mp4')
          const isAudio = img.mimeType?.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => img.fileName?.toLowerCase().endsWith(ext))
          const isSelected = selectedSlugs.includes(img.slug)

          return (
            <div
              key={img.id}
              className={`group relative bg-[#111] border rounded-xl flex flex-col transition-all ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              {/* Checkbox Overlay in Top-Left Corner */}
              <div className="absolute top-2.5 left-2.5 z-40" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelect(img.slug)}
                  className="w-4 h-4 rounded border-white/30 bg-black/80 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600 shadow-md"
                />
              </div>

              {/* 3-Dot Menu Button in Top-Right Corner */}
              <div className="absolute top-2 right-2 z-50" ref={activeMenu === img.slug ? menuRef : null} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveMenu(activeMenu === img.slug ? null : img.slug)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors shadow-xl ${
                    activeMenu === img.slug ? 'bg-white text-black font-bold' : 'bg-black/70 text-white hover:bg-black/90'
                  }`}
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {activeMenu === img.slug && (
                  <div className="absolute right-0 top-10 w-48 bg-[#161616] border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setActiveMenu(null)
                        setViewingInfo(img)
                      }}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Info className="w-4 h-4 text-blue-400" /> File Info
                    </button>
                    <button
                      onClick={() => handleDelete(img.slug)}
                      disabled={deleting === img.slug}
                      className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      onClick={() => handleSelect(img.slug)}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      {isSelected ? 'Deselect' : 'Select'}
                    </button>
                    {!isVideo && (
                      <button
                        onClick={() => {
                          setActiveMenu(null)
                          isAudio ? setViewingAudio(img) : setViewingImage(img)
                        }}
                        className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                      >
                        {isAudio ? <Play className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        {isAudio ? 'Play Audio' : 'View Full Screen'}
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(img.slug)}
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      {copied === img.slug ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      Copy Link
                    </button>
                    <a
                      href={`/i/${img.slug}?download=true`}
                      download
                      className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors block font-medium"
                      onClick={() => setActiveMenu(null)}
                    >
                      <div className="flex items-center gap-2.5"><Download className="w-4 h-4" /> Download</div>
                    </a>
                  </div>
                )}
              </div>

              {/* Image/Media Container */}
              <div className="relative aspect-square bg-[#0a0a0a] rounded-t-xl overflow-hidden flex flex-col items-center justify-center">
                {isAudio ? (
                  <div
                    onClick={() => setViewingAudio(img)}
                    className="w-full h-full flex flex-col items-center justify-center p-3 bg-[#121212] cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-600/20 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 mb-2 shadow-inner group-hover:bg-purple-600/40 group-hover:scale-110 transition-all duration-300">
                      <Play className="w-6 h-6 ml-1 fill-current opacity-0 group-hover:opacity-100 absolute transition-opacity" />
                      <Music className="w-7 h-7 group-hover:opacity-0 transition-opacity" />
                    </div>
                  </div>
                ) : isVideo ? (
                  <div
                    onClick={() => window.open(`/i/${img.slug}`, '_blank')}
                    className="relative w-full h-full cursor-pointer"
                  >
                    <video
                      src={`/i/${img.slug}?thumbnail=true`}
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-lg">
                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>
                ) : img.mimeType === 'image/gif' || img.fileName?.toLowerCase().endsWith('.gif') ? (
                  <video
                    src={`/i/${img.slug}?thumbnail=true`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />
                ) : (
                  <img
                    src={`/i/${img.slug}?thumbnail=true`}
                    alt={img.fileName}
                    loading="lazy"
                    onClick={() => setViewingImage(img)}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-white/[0.06] bg-[#0d0d0d] rounded-b-xl flex items-center justify-between">
                <p
                  className="text-xs text-white truncate font-medium cursor-pointer hover:text-blue-400 flex-1 pr-2"
                  onClick={() => !isVideo && !isAudio && setViewingImage(img)}
                  title={img.fileName}
                >
                  {img.fileName ? img.fileName.replace(/\.[^/.]+$/, '') : ''}
                </p>
                <span className="text-[11px] text-[#666] flex items-center gap-0.5 shrink-0" title="Views">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <RealtimeViewCount docId={img.id} collectionName="images" initialViews={img.views || 0} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {viewingImage && (
        <ImageViewer
          isOpen={!!viewingImage}
          onClose={() => setViewingImage(null)}
          imageUrl={`/i/${viewingImage.slug}?fromDashboard=true`}
          fileName={viewingImage.fileName}
          fileSizeMb={viewingImage.fileSizeMb || undefined}
          createdAt={viewingImage.createdAt}
          slug={viewingImage.slug}
        />
      )}

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
