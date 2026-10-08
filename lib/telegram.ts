import { adminDb } from '@/lib/firebase-admin'
import https from 'https'
import { URL } from 'url'

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeoutId)
    return res
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function getTelegramConfig(fileType?: 'image' | 'video' | 'audio') {
  try {
    const doc = await adminDb.collection('settings').doc('telegram').get()
    if (doc.exists) {
      const data = doc.data()
      if (fileType === 'image' && data?.imageBotToken && data?.imageChannelId) {
        return { botToken: data.imageBotToken, channelId: data.imageChannelId }
      }
      if (fileType === 'video' && data?.videoBotToken && data?.videoChannelId) {
        return { botToken: data.videoBotToken, channelId: data.videoChannelId }
      }
      if (fileType === 'audio' && data?.audioBotToken && data?.audioChannelId) {
        return { botToken: data.audioBotToken, channelId: data.audioChannelId }
      }
      // Fallback general settings
      if (data?.botToken && data?.channelId) {
        return { botToken: data.botToken, channelId: data.channelId }
      }
    }
  } catch (e) {
    // fallback
  }

  // Fallback to env vars
  const generalToken = process.env.TELEGRAM_BOT_TOKEN || ''
  const generalChannel = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_MASTER_CHANNEL_ID || ''
  if (generalToken && generalChannel) {
    return { botToken: generalToken, channelId: generalChannel }
  }

  const label = fileType === 'image' ? 'Images' : fileType === 'video' ? 'Videos' : fileType === 'audio' ? 'Audio' : 'Media'
  throw new Error(`Telegram Bot Token or Group ID for ${label} is not configured! Please set them in Dashboard -> Telegram ID.`)
}

export async function uploadToTelegramStreamWithProgress(
  file: File,
  fileType: 'image' | 'video' | 'audio',
  onProgress: (percent: number) => void
): Promise<{ file_id: string; message_id: number }> {
  const { botToken, channelId } = await getTelegramConfig(fileType)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const name = file.name.toLowerCase()
  const mime = file.type || ''

  const isAudio = fileType === 'audio'
  const isVideo = fileType === 'video'
  const isGif = mime === 'image/gif' || name.endsWith('.gif')
  const isStandardPhoto = (mime === 'image/jpeg' || mime === 'image/png') && !name.endsWith('.apng')

  let endpoint = 'sendDocument'
  let fieldName = 'document'

  if (isAudio) {
    endpoint = 'sendAudio'
    fieldName = 'audio'
  } else if (isVideo) {
    endpoint = 'sendVideo'
    fieldName = 'video'
  } else if (isGif) {
    endpoint = 'sendAnimation'
    fieldName = 'animation'
  } else if (isStandardPhoto) {
    endpoint = 'sendPhoto'
    fieldName = 'photo'
  }

  const result: any = await new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2)
    const url = new URL(`https://api.telegram.org/bot${botToken}/${endpoint}`)

    const dashDash = '--'
    const crlf = '\r\n'

    let extraFields = ''
    if (isGif) {
      extraFields += dashDash + boundary + crlf +
        `Content-Disposition: form-data; name="disable_content_type_detection"` + crlf + crlf +
        'true' + crlf
    }

    const headerBuf = Buffer.from(
      dashDash + boundary + crlf +
      `Content-Disposition: form-data; name="chat_id"` + crlf + crlf +
      channelId + crlf +
      extraFields +
      dashDash + boundary + crlf +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${file.name}"` + crlf +
      `Content-Type: ${mime || 'application/octet-stream'}` + crlf + crlf
    )

    const footerBuf = Buffer.from(crlf + dashDash + boundary + dashDash + crlf)
    const totalLength = headerBuf.length + buffer.length + footerBuf.length

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength,
      },
    }

    let responseData = ''
    const req = https.request(options, (res) => {
      res.on('data', (chunk) => { responseData += chunk })
      res.on('end', () => {
        clearInterval(progressInterval)
        try {
          const json = JSON.parse(responseData)
          if (json.ok) {
            onProgress(100)
          }
          resolve(json)
        } catch (e) {
          reject(new Error('Invalid JSON response from Telegram'))
        }
      })
    })

    req.on('error', (err) => {
      clearInterval(progressInterval)
      reject(err)
    })

    let lastReportedPercent = 0
    const progressInterval = setInterval(() => {
      if (req.socket && !req.destroyed) {
        const written = req.socket.bytesWritten || 0
        const percent = Math.min(98, Math.round((written / totalLength) * 100))
        if (percent > lastReportedPercent) {
          lastReportedPercent = percent
          onProgress(percent)
        }
      }
    }, 100)

    req.write(headerBuf)
    req.write(buffer)
    req.write(footerBuf)
    req.end(() => {
      clearInterval(progressInterval)
      onProgress(99)
    })
  })

  if (!result.ok) {
    throw new Error(`Telegram error (${fileType}): ${result.description}`)
  }

  const fileId =
    result.result.document?.file_id ||
    result.result.audio?.file_id ||
    result.result.video?.file_id ||
    result.result.animation?.file_id ||
    result.result.sticker?.file_id ||
    result.result.voice?.file_id ||
    (result.result.photo && result.result.photo.length > 0 ? result.result.photo[result.result.photo.length - 1].file_id : undefined)

  if (!fileId) {
    throw new Error('Could not retrieve file_id from Telegram response')
  }

  return {
    file_id: fileId,
    message_id: result.result.message_id,
  }
}

export async function uploadImageToTelegram(
  file: File
): Promise<{ file_id: string; message_id: number }> {
  const mime = file.type || ''
  const name = file.name.toLowerCase()
  const isAudio = mime.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => name.endsWith(ext))
  const isVideo = mime === 'video/mp4' || name.endsWith('.mp4')
  const fileType = isAudio ? 'audio' : isVideo ? 'video' : 'image'

  return uploadToTelegramStreamWithProgress(file, fileType, () => {})
}

export async function getTelegramFilePath(fileId: string, fileType: 'image' | 'video' | 'audio'): Promise<string> {
  try {
    const { botToken } = await getTelegramConfig(fileType)
    const res = await fetchWithTimeout(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`, {}, 8000)
    const data = await res.json()
    if (data.ok && data.result?.file_path) {
      return data.result.file_path
    }
  } catch (e) {}
  return ''
}

export async function getImageUrl(
  fileId: string,
  mimeType?: string,
  fileName?: string,
  docRef?: any,
  existingFilePath?: string
): Promise<string> {
  const isAudio = mimeType?.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => fileName?.toLowerCase().endsWith(ext))
  const isVideo = mimeType === 'video/mp4' || fileName?.toLowerCase().endsWith('.mp4')
  const fileType = isAudio ? 'audio' : isVideo ? 'video' : 'image'

  let botToken = ''
  try {
    const doc = await adminDb.collection('settings').doc('telegram').get()
    if (doc.exists) {
      const data = doc.data()
      if (fileType === 'video' && data?.videoBotToken) {
        botToken = data.videoBotToken
      } else if (fileType === 'audio' && data?.audioBotToken) {
        botToken = data.audioBotToken
      } else if (fileType === 'image' && data?.imageBotToken) {
        botToken = data.imageBotToken
      }
      if (!botToken) {
        botToken = data?.botToken || ''
      }
    }
  } catch (e) {}

  if (!botToken) {
    botToken = process.env.TELEGRAM_BOT_TOKEN || ''
  }

  if (!botToken) throw new Error('Telegram Bot Token is not configured.')

  if (existingFilePath) {
    return `https://api.telegram.org/file/bot${botToken}/${existingFilePath}`
  }

  const BASE = `https://api.telegram.org/bot${botToken}`
  const res = await fetchWithTimeout(`${BASE}/getFile?file_id=${fileId}`, {}, 15000)
  const data = await res.json()
  if (!data.ok) throw new Error(`Telegram error: ${data.description}`)

  const filePath = data.result.file_path

  if (docRef) {
    docRef.update({ telegramFilePath: filePath }).catch(() => {})
  }

  return `https://api.telegram.org/file/bot${botToken}/${filePath}`
}

export async function deleteImageFromTelegram(messageId: number): Promise<void> {
  const { botToken, channelId } = await getTelegramConfig().catch(() => ({ botToken: '', channelId: '' }))
  if (!botToken || !channelId) return

  const BASE = `https://api.telegram.0rg/bot${botToken}`.replace('.0rg', '.org')
  await fetchWithTimeout(`${BASE}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: channelId,
      message_id: messageId,
    }),
  }, 5000)
}
