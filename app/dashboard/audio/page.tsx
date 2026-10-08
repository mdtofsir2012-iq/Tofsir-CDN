import UploadZone from '@/components/dashboard/UploadZone'
import AudioGrid from '@/components/dashboard/AudioGrid'
import { getAudiosData } from '@/lib/dashboard-data'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export default async function AudioPage() {
  const { user } = await getCurrentUser()
  const audios = await getAudiosData(user.id)

  const serialized = audios.map((img: typeof audios[number]) => ({
    id: img.id,
    slug: img.slug,
    fileName: img.fileName,
    fileSizeMb: img.fileSizeMb,
    mimeType: img.mimeType,
    telegramMsgId: img.telegramMsgId,
    views: img.views || 0,
    createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : (img.createdAt?.toDate ? img.createdAt.toDate().toISOString() : new Date().toISOString())
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Audio</h1>
        <p className="text-sm text-[#555] mt-1">
          Manage and stream all your uploaded audio files (MP3, WAV, OGG, etc.)
        </p>
      </div>

      <UploadZone type="audio" />

      <AudioGrid audios={serialized} />
    </div>
  )
}
