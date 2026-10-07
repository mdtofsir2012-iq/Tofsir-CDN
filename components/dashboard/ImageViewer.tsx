'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Download, X, CheckCircle2 } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fileName: string
  fileSizeMb?: number
  createdAt?: string
  slug?: string
}

export default function ImageViewer({ isOpen, onClose, imageUrl, fileName, fileSizeMb, createdAt, slug }: Props) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  async function handleCopy() {
    await navigator.clipboard.writeText(imageUrl)
    setCopied(true)
    toast.success('Image URL copied to clipboard! ✨')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
    >
      {/* Top Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl flex items-center justify-between text-white py-2 px-4"
      >
        <div>
          <h2 className="text-sm font-medium truncate max-w-sm sm:max-w-xl">{fileName}</h2>
          <p className="text-[11px] text-[#888] mt-0.5">
            {fileSizeMb ? `${fileSizeMb} MB` : ''} {createdAt ? `• ${new Date(createdAt).toLocaleDateString()}` : ''}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 flex items-center justify-center p-2 w-full h-full min-h-0 min-w-0"
      >
        <img
          src={imageUrl}
          alt={fileName}
          className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl"
        />
      </div>

      {/* Bottom Right Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl flex items-center justify-end gap-3 py-2 px-4"
      >
        <button
          onClick={handleCopy}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 backdrop-blur-md shadow-lg"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <a
          href={`${imageUrl}?download=true`}
          download
          className="bg-green-600 hover:bg-green-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-lg"
        >
          <Download className="w-4 h-4" /> Download
        </a>
      </div>
    </div>
  )
}
