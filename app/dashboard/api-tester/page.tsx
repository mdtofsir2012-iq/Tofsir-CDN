'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type MediaItem = {
  id: string
  url: string
  fileName: string
  size: number
  type: string
  uploadedAt: string
}

export default function ApiTesterPage() {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<MediaItem[]>([])
  const [tested, setTested] = useState(false)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('0%')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<any>(null)

  async function handleTestKey(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key (e.g. tofsir_...)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/images', {
        headers: { 'x-api-key': apiKey.trim() }
      })
      const data = await res.json()

      if (res.ok) {
        setFiles(data.images || [])
        setTested(true)
        toast.success(`API Key valid! Found ${data.count || 0} files.`)
      } else {
        toast.error(data.error || 'Invalid API Key or unauthorized')
        setFiles([])
        setTested(false)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect to API')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim()) {
      toast.error('Please enter your API key first')
      return
    }
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadProgress('0%')
    setUploadResult(null)

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/v1/upload')
      xhr.setRequestHeader('x-api-key', apiKey.trim())

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(`${percent}% uploaded`)
        }
      }

      xhr.onload = async () => {
        try {
          const data = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadResult(data)
            toast.success('File uploaded successfully via API Key! 🎉')
            setSelectedFile(null)
            // Refresh files list
            await handleTestKey()
            resolve()
          } else {
            toast.error(data.error || 'Upload failed via API Key')
            resolve()
          }
        } catch (e) {
          toast.error('Server response parsing error')
          resolve()
        } finally {
          setUploading(false)
        }
      }

      xhr.onerror = () => {
        toast.error('Network upload error')
        setUploading(false)
        resolve()
      }

      const formData = new FormData()
      formData.append('image', selectedFile)
      xhr.send(formData)
    })
  }

  async function handleDelete(slug: string) {
    if (!confirm('Delete this file using API Key?')) return

    try {
      const res = await fetch(`/api/v1/images/${slug}`, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey.trim() }
      })

      if (res.ok) {
        toast.success('File deleted successfully via API Key')
        setFiles(prev => prev.filter(f => f.id !== slug))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Delete failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete error')
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-white">API Key Tester & Sandbox</h1>
        <p className="text-sm text-[#555] mt-1">
          Manually test your API Key: verify authentication, upload files with live progress, fetch file details, and delete files using only your API Key.
        </p>
      </div>

      {/* API Key Input Card */}
      <form onSubmit={handleTestKey} className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#888] mb-2">
            Enter API Key (`tofsir_...`)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="tofsir_xxxxxxxxxxxxxxxxxxxxxxx"
              className="flex-1 bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="bg-white text-black text-xs font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? 'Verifying...' : 'Verify & Load Files 🔍'}
            </button>
          </div>
          {!tested && (
            <p className="text-[11px] text-amber-400/80 mt-2">
              ⚠️ Enter your API key above and click &quot;Verify & Load Files&quot; to unlock the upload sandbox and file manager.
            </p>
          )}
        </div>
      </form>

      {tested && (
        <div className="space-y-8">
          {/* Upload Sandbox */}
          <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <span>🚀</span> Test File Upload via API Key
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/30 transition-all bg-[#0a0a0a]">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#888] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                />
                <p className="text-[11px] text-[#555] mt-2">
                  Supports Images, MP4 Videos, and Audio (MP3, WAV, OGG, M4A, AAC) up to 20MB.
                </p>
              </div>

              {uploading && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#888]">Uploading via API Key...</span>
                  <span className="text-blue-400 font-bold">{uploadProgress}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 w-full flex items-center justify-center gap-2"
              >
                {uploading ? `Uploading (${uploadProgress})...` : 'Upload File via API Key ⬆️'}
              </button>
            </form>

            {uploadResult && (
              <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 space-y-2 font-mono text-xs">
                <p className="text-emerald-400 font-medium">✅ Upload Successful!</p>
                <p className="text-blue-400 truncate">URL: <a href={uploadResult.url} target="_blank" rel="noopener noreferrer" className="underline">{uploadResult.url}</a></p>
                <p className="text-[#888]">File Name: {uploadResult.fileName}</p>
                <p className="text-[#888]">Size: {uploadResult.size} bytes</p>
              </div>
            )}
          </div>

          {/* Files List fetched via API Key */}
          <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                <span>📁</span> Files Authenticated & Fetched via API Key ({files.length})
              </h2>
              <button
                onClick={() => handleTestKey()}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Refresh List 🔄
              </button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-12 text-[#666] text-xs">
                No files found for this API Key. Upload one above!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file) => {
                  const isVideo = file.type === 'video/mp4' || file.fileName?.toLowerCase().endsWith('.mp4')
                  const isAudio = file.type?.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => file.fileName?.toLowerCase().endsWith(ext))

                  return (
                    <div key={file.id} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-white font-medium truncate max-w-[200px]">{file.fileName}</p>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-[#aaa]">{file.size} MB</span>
                        </div>

                        {/* Preview */}
                        <div className="aspect-video bg-black/40 rounded-lg overflow-hidden flex items-center justify-center">
                          {isAudio ? (
                            <div className="flex flex-col items-center justify-center p-2 w-full">
                              <span className="text-2xl mb-1">🎵</span>
                              <audio src={file.url} controls className="w-full h-8" />
                            </div>
                          ) : isVideo ? (
                            <video src={file.url} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={file.url}
                            className="bg-[#141414] border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-blue-400 flex-1 truncate"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(file.url)
                              toast.success('URL copied!')
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white text-[11px] px-2.5 py-1 rounded transition-colors shrink-0"
                          >
                            Copy 📋
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <a
                            href={`${file.url}?download=true`}
                            download
                            className="text-xs text-green-400 hover:text-green-300 font-medium flex items-center gap-1"
                          >
                            Download ⬇️
                          </a>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-medium"
                          >
                            Delete via API 🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
