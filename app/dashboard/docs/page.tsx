'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic';

export default function DocsPage() {
  const [lang, setLang] = useState<'curl' | 'js' | 'python' | 'php'>('curl')
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.origin : 'https://yourdomain.com'

  const snippets = {
    curl: `curl -X POST "${origin}/api/v1/upload" \\\n  -H "x-api-key: your_api_key_here" \\\n  -F "image=@/path/to/file.png"`,
    js: `async function uploadMedia() {\n  const form = new FormData();\n  form.append('image', fileInput.files[0]);\n\n  const res = await fetch('${origin}/api/v1/upload', {\n    method: 'POST',\n    headers: { 'x-api-key': 'your_api_key_here' },\n    body: form\n  });\n  const data = await res.json();\n  console.log('File URL:', data.url);\n}`,
    python: `import requests\n\nurl = "${origin}/api/v1/upload"\nheaders = {"x-api-key": "your_api_key_here"}\nfiles = {"image": open("file.mp4", "rb")}\n\nresponse = requests.post(url, headers=headers, files=files)\nprint(response.json())`,
    php: `<?php\n\$url = '${origin}/api/v1/upload';\n\$apiKey = 'your_api_key_here';\n\$filePath = '/path/to/audio.mp3';\n\n\$curl = curl_init();\ncurl_setopt_array(\$curl, [\n    CURLOPT_URL => \$url,\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_POST => true,\n    CURLOPT_HTTPHEADER => ["x-api-key: \$apiKey"],\n    CURLOPT_POSTFIELDS => [\n        'image' => new CURLFile(\$filePath)\n    ]\n]);\n\n\$response = curl_exec(\$curl);\ncurl_close(\$curl);\necho \$response;\n?>`
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-white">API Documentation</h1>
        <p className="text-sm text-[#555] mt-1">
          Complete guide and code examples to integrate ImgStorage API into your apps
        </p>
      </div>

      {/* Base URL & Overview */}
      <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-white">Base URL & Authentication</h2>
        <p className="text-xs text-[#888]">
          All API requests require the <code className="text-blue-400 font-mono">x-api-key</code> header with your valid API key generated from the API Keys tab.
        </p>
        <div className="bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-4 py-3 font-mono text-xs text-blue-400">
          {origin}/api/v1/upload
        </div>
      </div>

      {/* Interactive Code Example */}
      <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-white">Quick Upload Example</h2>
        <p className="text-xs text-[#888]">
          Supports Images (JPEG, PNG, WebP, GIF, etc.), Videos (MP4), and Audio (MP3, WAV, OGG, M4A, AAC) up to 20MB.
        </p>

        <div className="space-y-3 bg-[#080808] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center justify-between gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 transition-colors w-48"
            >
              <option value="curl">cURL</option>
              <option value="js">JavaScript (Fetch)</option>
              <option value="python">Python (Requests)</option>
              <option value="php">PHP (cURL)</option>
            </select>

            <button
              onClick={() => handleCopy(snippets[lang])}
              className="bg-white/10 hover:bg-white/20 text-white text-[11px] px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
            >
              {copied ? 'Copied Code! ✨' : 'Copy Code 📋'}
            </button>
          </div>

          <pre className="bg-[#040404] border border-white/[0.04] p-3 rounded-lg font-mono text-xs text-[#ccc] overflow-x-auto whitespace-pre">
            {snippets[lang]}
          </pre>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-white">API Endpoints Reference</h2>

        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold px-2 py-1 rounded font-mono bg-emerald-500/10 text-emerald-400">
              POST
            </span>
            <span className="font-mono text-xs text-white">/api/v1/upload</span>
          </div>
          <p className="text-xs text-[#888]">Uploads any media file (image, video, or audio) using multipart/form-data.</p>
          <div className="space-y-1 text-xs font-mono text-[#aaa]">
            <div><span className="text-gray-500">Header:</span> x-api-key: YOUR_API_KEY</div>
            <div><span className="text-gray-500">Body:</span> multipart/form-data (key: <code>image</code>)</div>
            <div><span className="text-gray-500">Max Size:</span> 20 MB</div>
          </div>
        </div>
      </div>
    </div>
  )
}
