'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'
import { clientDb } from '@/lib/firebase-admin'
import { formatNumber } from '@/lib/utils'

type Props = {
  id: string
  name: string
  apiKey: string
  usageCount: number
  totalViews?: number
  createdAt: string
  type?: string
  defaultLang?: string
}

const LANGUAGE_LABELS: Record<string, string> = {
  curl: 'cURL',
  js: 'JavaScript (Fetch)',
  node: 'Node.js (Axios)',
  python: 'Python (Requests)',
  php: 'PHP (cURL)',
  go: 'Go',
  dart: 'Dart / Flutter',
  csharp: 'C# (.NET)'
}

const ALL_LANGS = ['curl', 'js', 'node', 'python', 'php', 'go', 'dart', 'csharp']

export default function ApiKeyCard({
  id,
  name,
  apiKey,
  usageCount,
  totalViews = 0,
  createdAt,
  type = 'all',
  defaultLang = 'curl'
}: Props) {
  const router = useRouter()
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLang, setSelectedLang] = useState(ALL_LANGS.includes(defaultLang) ? defaultLang : 'curl')
  const [rtUsage, setRtUsage] = useState(usageCount)
  const [rtViews, setRtViews] = useState(totalViews)

  useEffect(() => {
    setRtUsage(usageCount)
  }, [usageCount])

  useEffect(() => {
    setRtViews(totalViews)
  }, [totalViews])

  // Real-time listener for API key usage & views
  useEffect(() => {
    const unsub = onSnapshot(doc(clientDb, 'apiKeys', id), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        if (typeof data.usageCount === 'number') setRtUsage(data.usageCount)
        if (typeof data.totalViews === 'number') setRtViews(data.totalViews)
      }
    })
    return unsub
  }, [id])

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippet)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('Failed to delete API key')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const getSnippet = (lang: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://img.tofsir.com'
    const endpoint = `${origin}/api/v1/upload`

    switch (lang) {
      case 'js':
        return `const formData = new FormData();\nformData.append('image', fileInput.files[0]);\n\nconst res = await fetch('${endpoint}', {\n  method: 'POST',\n  headers: { 'x-api-key': '${apiKey}' },\n  body: formData\n});\nconst data = await res.json();\nconsole.log(data.url);`
      case 'node':
        return `import axios from 'axios';\nimport FormData from 'form-data';\nimport fs from 'fs';\n\nconst form = new FormData();\nform.append('image', fs.createReadStream('file.png'));\n\nconst res = await axios.post('${endpoint}', form, {\n  headers: { ...form.getHeaders(), 'x-api-key': '${apiKey}' }\n});\nconsole.log(res.data.url);`
      case 'python':
        return `import requests\n\nurl = '${endpoint}'\nfiles = {'image': open('file.png', 'rb')}\nheaders = {'x-api-key': '${apiKey}'}\n\nres = requests.post(url, files=files, headers=headers)\nprint(res.json()['url'])`
      case 'php':
        return `$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, '${endpoint}');\ncurl_setopt($ch, CURLOPT_POST, true);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, ['image' => new CURLFile('file.png')]);\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ['x-api-key: ${apiKey}']);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);\ncurl_close($ch);\necho $response;`
      case 'go':
        return `package main\n\nimport (\n\t"bytes"\n\t"io"\n\t"mime/multipart"\n\t"net/http"\n\t"os"\n)\n\nfunc main() {\n\tfile, _ := os.Open("file.png")\n\tdefer file.Close()\n\n\tbody := &bytes.Buffer{}\n\twriter := multipart.NewWriter(body)\n\tpart, _ := writer.CreateFormFile("image", "file.png")\n\tio.Copy(part, file)\n\twriter.Close()\n\n\treq, _ := http.NewRequest("POST", "${endpoint}", body)\n\treq.Header.Set("Content-Type", writer.FormDataContentType())\n\treq.Header.Set("x-api-key", "${apiKey}")\n\tresp, _ := http.DefaultClient.Do(req)\n\tdefer resp.Body.Close()\n}`
      case 'dart':
        return `import 'package:http/http.dart' as http;\n\nFuture<void> uploadFile() async {\n  var request = http.MultipartRequest('POST', Uri.parse('${endpoint}'))\n    ..headers['x-api-key'] = '${apiKey}'\n    ..files.add(await http.MultipartFile.fromPath('image', 'file.png'));\n  \n  var response = await request.send();\n  if (response.statusCode == 200) print('Uploaded!');\n}`
      case 'csharp':
        return `using var client = new HttpClient();\nusing var form = new MultipartFormDataContent();\nusing var fileStream = new FileStream("file.png", FileMode.Open);\nform.Add(new StreamContent(fileStream), "image", "file.png");\n\nclient.DefaultRequestHeaders.Add("x-api-key", "${apiKey}");\nvar response = await client.PostAsync("${endpoint}", form);\nvar result = await response.Content.ReadAsStringAsync();\nConsole.WriteLine(result);`
      case 'curl':
      default:
        return `curl -X POST '${endpoint}' \\\n  -H 'x-api-key: ${apiKey}' \\\n  -F 'image=@/path/to/file.png'`
    }
  }

  const snippet = getSnippet(selectedLang)

  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 space-y-4 hover:border-white/[0.15] transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">{name}</p>
            <span className="text-[10px] bg-white/[0.06] border border-white/[0.08] text-[#aaa] px-2 py-0.5 rounded capitalize">
              {type === 'image' ? '🖼️ Images Only' : type === 'video' ? '🎥 Videos Only' : type === 'audio' ? '🎵 Audio Only' : '⚡ Universal'}
            </span>
          </div>
          <p className="text-xs text-[#444] mt-0.5">
            Created {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#555] bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-md flex items-center gap-1" title="API Uploads">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            {formatNumber(rtUsage)}
          </span>
          <span className="text-xs text-[#555] bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-md flex items-center gap-1" title="Total Views">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            {formatNumber(rtViews)}
          </span>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="text-xs text-[#555] hover:text-red-400 transition-colors p-1"
          >
            {deleting ? (
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2">
        <code className="text-xs font-mono text-[#888] truncate flex-1 select-all">
          {apiKey}
        </code>
        <button
          onClick={handleCopyKey}
          className="text-xs text-[#888] hover:text-white transition-colors flex items-center gap-1 shrink-0"
        >
          {copiedKey ? (
            <span className="text-green-400 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Copied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy Key
            </span>
          )}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#666]">SDK & API Snippet</span>
          <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-none no-scrollbar">
            {ALL_LANGS.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                  selectedLang === lang
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-[#555] hover:text-[#888] bg-white/[0.02]'
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-3 group">
          <pre className="text-[11px] font-mono text-[#aaa] overflow-x-auto max-h-[140px] leading-relaxed">
            {snippet}
          </pre>
          <button
            onClick={handleCopySnippet}
            className="absolute top-2.5 right-2.5 text-[10px] text-[#666] hover:text-white bg-[#1a1a1a] border border-white/[0.08] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            {copiedSnippet ? 'Copied!' : 'Copy Snippet'}
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-semibold text-white">Delete API Key?</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              Are you sure you want to delete <span className="text-white font-medium">"{name}"</span>? Any applications using this key will immediately fail to upload.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-xs text-[#888] hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
