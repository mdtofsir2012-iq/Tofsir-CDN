'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  name: string
  apiKey: string
  usageCount: number
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

export default function ApiKeyCard({ id, name, apiKey, usageCount, createdAt, type, defaultLang }: Props) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showUsage, setShowUsage] = useState(false)
  const [lang, setLang] = useState<string>(defaultLang || 'curl')

  const router = useRouter()

  async function handleCopy() {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCopyCode(code: string) {
    await navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  async function handleDelete() {
    if (!confirm(`Delete key "${name}"?`)) return
    setDeleting(true)
    await fetch(`/api/keys/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const masked = apiKey.slice(0, 14) + '••••••••••••••••••••'
  const origin = typeof window !== 'undefined' ? window.origin : 'https://yourdomain.com'

  const sampleFile = type === 'image' ? 'photo.png' : type === 'video' ? 'video.mp4' : type === 'audio' ? 'audio.mp3' : 'file.png'

  const snippets: Record<string, string> = {
    curl: `curl -X POST "${origin}/api/v1/upload" \\\n  -H "x-api-key: ${apiKey}" \\\n  -F "image=@/path/to/${sampleFile}"`,

    js: `async function uploadMedia(file) {\n  const form = new FormData();\n  form.append('image', file);\n  \n  try {\n    const res = await fetch('${origin}/api/v1/upload', {\n      method: 'POST',\n      headers: { 'x-api-key': '${apiKey}' },\n      body: form\n    });\n    const data = await res.json();\n    if (!res.ok) throw new Error(data.error || 'Upload failed');\n    return data;\n  } catch (err) {\n    console.error('Upload error:', err.message);\n  }\n}`,

    node: `const axios = require('axios');\nconst FormData = require('form-data');\nconst fs = require('fs');\n\nasync function uploadFile(filePath) {\n  const form = new FormData();\n  form.append('image', fs.createReadStream(filePath));\n\n  try {\n    const response = await axios.post('${origin}/api/v1/upload', form, {\n      headers: {\n        'x-api-key': '${apiKey}',\n        ...form.getHeaders()\n      }\n    });\n    console.log('Success:', response.data);\n  } catch (error) {\n    console.error('Failed:', error.response?.data || error.message);\n  }\n}`,

    python: `import requests\n\ndef upload_file(file_path):\n    url = "${origin}/api/v1/upload"\n    headers = {"x-api-key": "${apiKey}"}\n    \n    try:\n        with open(file_path, "rb") as f:\n            files = {"image": f}\n            response = requests.post(url, headers=headers, files=files)\n            response.raise_for_status()\n            return response.json()\n    except requests.exceptions.RequestException as e:\n        print(f"Error: {e}")`,

    php: `<?php\n\$url = '${origin}/api/v1/upload';\n\$apiKey = '${apiKey}';\n\$filePath = '/path/to/${sampleFile}';\n\n\$curl = curl_init();\ncurl_setopt_array(\$curl, [\n    CURLOPT_URL => \$url,\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_POST => true,\n    CURLOPT_HTTPHEADER => ["x-api-key: \$apiKey"],\n    CURLOPT_POSTFIELDS => [\n        'image' => new CURLFile(\$filePath)\n    ]\n]);\n\n\$response = curl_exec(\$curl);\ncurl_close(\$curl);\necho \$response;\n?>`,

    go: `package main\n\nimport (\n\t"bytes"\n\t"io"\n\t"mime/multipart"\n\t"net/http"\n\t"os"\n\t"path/filepath"\n)\n\nfunc uploadFile(filename string) ([]byte, error) {\n\tfile, err := os.Open(filename)\n\tif err != nil { return nil, err }\n\tdefer file.Close()\n\n\tbody := &bytes.Buffer{}\n\twriter := multipart.NewWriter(body)\n\tpart, _ := writer.CreateFormFile("image", filepath.Base(filename))\n\tio.Copy(part, file)\n\twriter.Close()\n\n\treq, _ := http.NewRequest("POST", "${origin}/api/v1/upload", body)\n\treq.Header.Set("x-api-key", "${apiKey}")\n\treq.Header.Set("Content-Type", writer.FormDataContentType())\n\n\tclient := &http.Client{}\n\tresp, _ := client.Do(req)\n\tdefer resp.Body.Close()\n\n\treturn io.ReadAll(resp.Body)\n}`,

    dart: `import 'package:http/http.dart' as http;\nimport 'dart:io';\n\nFuture<void> uploadFile(File file) async {\n  var request = http.MultipartRequest('POST', Uri.parse('${origin}/api/v1/upload'));\n  request.headers['x-api-key'] = '${apiKey}';\n  request.files.add(await http.MultipartFile.fromPath('image', file.path));\n\n  var streamedResponse = await request.send();\n  var response = await http.Response.fromStream(streamedResponse);\n  \n  if (response.statusCode == 200) {\n    print('Success: \${response.body}');\n  } else {\n    print('Failed: \${response.body}');\n  }\n}`,

    csharp: `using System.Net.Http;\n\nasync Task UploadFileAsync(string filePath)\n{\n    using var client = new HttpClient();\n    using var content = new MultipartFormDataContent();\n    using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);\n    \n    content.Add(new StreamContent(fileStream), "image", Path.GetFileName(filePath));\n    client.DefaultRequestHeaders.Add("x-api-key", "${apiKey}");\n\n    var response = await client.PostAsync("${origin}/api/v1/upload", content);\n    var result = await response.Content.ReadAsStringAsync();\n    Console.WriteLine(result);\n}`
  }

  return (
    <div className="bg-[#111] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors space-y-4">
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
          <span className="text-xs text-[#555] bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-md">
            {usageCount.toLocaleString()} requests
          </span>
          <button
            onClick={handleDelete}
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

      {/* Key display */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 font-mono text-xs text-[#666] truncate">
          {visible ? apiKey : masked}
        </div>
        <button
          onClick={() => setVisible(!visible)}
          className="p-2.5 bg-[#0a0a0a] border border-white/[0.06] rounded-lg text-[#555] hover:text-white hover:border-white/[0.1] transition-all"
          title={visible ? 'Hide' : 'Show'}
        >
          {visible ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
        <button
          onClick={handleCopy}
          className="p-2.5 bg-[#0a0a0a] border border-white/[0.06] rounded-lg text-[#555] hover:text-white hover:border-white/[0.1] transition-all"
          title="Copy"
        >
          {copied ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )}
        </button>
      </div>

      {/* Usage code dropdown section */}
      <div className="pt-2 border-t border-white/[0.04]">
        <button
          onClick={() => setShowUsage(!showUsage)}
          className="flex items-center justify-between w-full text-xs text-[#888] hover:text-white transition-colors py-1"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <span>💻</span> Advanced Usage Code Snippets ({type === 'image' ? 'Image' : type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Universal'})
          </span>
          <span className="text-[11px]">{showUsage ? '▲ Hide' : '▼ Show Code'}</span>
        </button>

        {showUsage && (
          <div className="mt-3 space-y-3 bg-[#080808] border border-white/[0.06] rounded-lg p-3">
            <div className="flex items-center justify-between gap-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 transition-colors flex-1 max-w-[220px]"
              >
                {ALL_LANGS.map((lKey) => (
                  <option key={lKey} value={lKey}>
                    {LANGUAGE_LABELS[lKey] || lKey}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleCopyCode(snippets[lang] || '')}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1 shrink-0"
              >
                {copiedCode ? 'Copied Code! ✨' : 'Copy Code 📋'}
              </button>
            </div>

            <pre className="bg-[#040404] border border-white/[0.04] p-3 rounded-lg font-mono text-[11px] text-[#ccc] overflow-x-auto whitespace-pre">
              {snippets[lang] || '// Select a language'}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
