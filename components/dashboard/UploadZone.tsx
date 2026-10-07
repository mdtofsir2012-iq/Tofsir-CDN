'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { isValidImageFile } from '@/lib/utils'
import {
  Film, Music, Image as ImageIcon,
  CheckCircle2, XCircle, Loader2, Copy, Download, ExternalLink
} from 'lucide-react'

type UploadState = {
  name: string
  progress: string
  status: 'uploading' | 'done' | 'error'
  url?: string
  error?: string
  copied?: boolean
}

export default function UploadZone({ type = 'images' }: { type?: 'images' | 'videos' | 'audio' }) {
  const [uploads, setUploads] = useState<UploadState[]>([])
  const router = useRouter()

  function updateUpload(name: string, patch: Partial<UploadState>) {
    setUploads((prev) =>
      prev.map((u) => (u.name === name ? { ...u, ...patch } : u))
    )
  }

  async function uploadFile(file: File) {
    const isVideo = file.type === 'video/mp4' || file.name?.toLowerCase().endsWith('.mp4')
    const isAudio = file.type?.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => file.name?.toLowerCase().endsWith(ext))

    if (type === 'images' && (isVideo || isAudio)) {
      setUploads((prev) => [
        { name: file.name, progress: '', status: 'error', error: 'Only image files allowed in Images tab.' },
        ...prev,
      ])
      return
    }

    if (type === 'videos' && !isVideo) {
      setUploads((prev) => [
        { name: file.name, progress: '', status: 'error', error: 'Only MP4 video files allowed in Videos tab.' },
        ...prev,
      ])
      return
    }

    if (type === 'audio' && !isAudio) {
      setUploads((prev) => [
        { name: file.name, progress: '', status: 'error', error: 'Only MP3, WAV, OGG, M4A, AAC audio files allowed in Audio tab.' },
        ...prev,
      ])
      return
    }

    if (!isValidImageFile(file)) {
      setUploads((prev) => [
        { name: file.name, progress: '', status: 'error', error: type === 'videos' ? 'Only MP4 videos allowed' : type === 'audio' ? 'Only MP3, WAV, OGG, M4A, AAC audio allowed' : 'Only JPEG, JPG, PNG, WebP, GIF, AVIF, APNG, ICO images allowed' },
        ...prev,
      ])
      return
    }

    const maxSize = type === 'videos' || type === 'audio' ? 20 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploads((prev) => [
        { name: file.name, progress: '', status: 'error', error: 'Max 20MB' },
        ...prev,
      ])
      return
    }

    setUploads((prev) => [
      { name: file.name, progress: 'Uploading... 00:00', status: 'uploading' },
      ...prev,
    ])

    let elapsedSeconds = 0
    const timerInterval = setInterval(() => {
      elapsedSeconds += 1
      const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')
      const secs = (elapsedSeconds % 60).toString().padStart(2, '0')
      updateUpload(file.name, { progress: `Uploading... ${mins}:${secs}` })
    }, 1000)

    try {
      const form = new FormData()
      form.append('image', file)

      const response = await fetch('/api/v1/upload-dashboard', {
        method: 'POST',
        body: form,
      })

      clearInterval(timerInterval)

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Upload failed')
        let errJson
        try { errJson = JSON.parse(errText) } catch (e) {}
        updateUpload(file.name, {
          status: 'error',
          error: errJson?.error || errText || 'Upload failed',
        })
        return
      }

      const data = await response.json().catch(() => null)
      const finalMins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')
      const finalSecs = (elapsedSeconds % 60).toString().padStart(2, '0')

      if (data && data.success) {
        updateUpload(file.name, {
          status: 'done',
          progress: `Uploaded Successfully! (${finalMins}:${finalSecs})`,
          url: data.url,
        })
        router.refresh()

        // Auto hide success card after 5 seconds
        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.name !== file.name))
        }, 5000)
      } else {
        updateUpload(file.name, {
          status: 'error',
          error: data?.error || 'Upload failed',
        })
      }
    } catch (err: any) {
      clearInterval(timerInterval)
      updateUpload(file.name, {
        status: 'error',
        error: err.message || 'Upload failed',
      })
    }
  }

  const handleCopy = async (name: string, url: string) => {
    await navigator.clipboard.writeText(url)
    updateUpload(name, { copied: true })
    setTimeout(() => updateUpload(name, { copied: false }), 2000)
  }

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await uploadFile(file)
    }
  }, [type])

  const acceptConfig: Record<string, string[]> = type === 'videos' ? {
    'video/mp4': ['.mp4'],
  } : type === 'audio' ? {
    'audio/mpeg': ['.mp3'],
    'audio/mp3': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/x-wav': ['.wav'],
    'audio/ogg': ['.ogg'],
    'audio/m4a': ['.m4a'],
    'audio/x-m4a': ['.m4a'],
    'audio/aac': ['.aac'],
  } : {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
    'image/avif': ['.avif'],
    'image/apng': ['.apng'],
    'image/x-icon': ['.ico'],
    'image/vnd.microsoft.icon': ['.ico'],
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig,
    maxSize: type === 'videos' || type === 'audio' ? 20 * 1024 * 1024 : 10 * 1024 * 1024,
  })

  const TypeIcon = type === 'videos' ? Film : type === 'audio' ? Music : ImageIcon

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30 bg-[#111]'}`}
      >
        <input {...getInputProps()} />
        <TypeIcon className="w-10 h-10 mb-3 text-[#555]" />
        {isDragActive ? (
          <p className="text-blue-400 font-medium text-sm">Drop {type === 'videos' ? 'videos' : type === 'audio' ? 'audio' : 'images'} here...</p>
        ) : (
          <>
            <p className="text-white font-medium text-sm">Drag & drop {type === 'videos' ? 'MP4 videos' : type === 'audio' ? 'MP3, WAV, OGG, M4A, AAC audio' : 'images'} here</p>
            <p className="text-[#666] text-xs mt-1">
              {type === 'videos'
                ? 'or click to browse — MP4 video up to 20MB'
                : type === 'audio'
                ? 'or click to browse — MP3, WAV, OGG, M4A, AAC up to 20MB'
                : 'or click to browse — JPEG, JPG, PNG, WebP, GIF, AVIF, APNG, ICO up to 10MB'}
            </p>
          </>
        )}
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u, i) => (
            <div key={i} className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="shrink-0">
                    {u.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : u.status === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                  </span>
                  <p className="text-xs font-medium text-white truncate max-w-xs">{u.name}</p>
                </div>
                <span className="text-xs text-blue-400 font-mono font-medium animate-pulse">{u.progress}</span>
              </div>

              {u.error && <p className="text-xs text-red-400">{u.error}</p>}

              {u.url && (
                <div className="flex flex-col gap-2 bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 mt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={u.url}
                      className="flex-1 bg-transparent text-xs font-mono text-blue-400 outline-none truncate"
                    />
                    <button
                      onClick={() => handleCopy(u.name, u.url!)}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded transition-colors font-medium shrink-0 flex items-center gap-1.5"
                    >
                      {u.copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {u.copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1.5 rounded transition-colors font-medium shrink-0 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-[#777]">Direct Download:</span>
                    <a
                      href={`${u.url}?download=true`}
                      download
                      className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded transition-colors font-medium shrink-0 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
