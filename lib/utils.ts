import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/apng',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/ico',
  'video/mp4',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/webm'
]

export const ALLOWED_MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.apng', '.ico', '.mp4', '.mp3', '.wav', '.ogg', '.m4a', '.aac']

export function isValidImageFile(file: { type?: string; name?: string }): boolean {
  if (!file) return false
  const mime = file.type?.toLowerCase() || ''
  const name = file.name?.toLowerCase() || ''
  const isMediaMime = mime.startsWith('image/') || mime === 'video/mp4' || mime.startsWith('audio/') || ALLOWED_MEDIA_TYPES.includes(mime)
  const hasValidExt = ALLOWED_MEDIA_EXTENSIONS.some(ext => name.endsWith(ext))
  return isMediaMime || hasValidExt
}

export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0'
  if (num < 1000) return num.toString()
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
}
