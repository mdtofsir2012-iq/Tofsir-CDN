import { customAlphabet } from 'nanoid'

const nanoid23 = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 23)

export function generateApiKey(): string {
  // Format: tofsir_ (7 chars) + 23 random chars = 30 chars total
  return `tofsir_${nanoid23()}`
}
