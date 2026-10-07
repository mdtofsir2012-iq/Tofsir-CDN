import UploadZone from '@/components/dashboard/UploadZone'
import VideoGrid from '@/components/dashboard/VideoGrid'
import { getImagesData } from '@/lib/dashboard-data'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  const { user } = await getCurrentUser()
  const images = await getImagesData(user.id)

  const videos = images.filter((img: any) =>
    (img.mimeType === 'video/mp4' || img.fileName?.toLowerCase().endsWith('.mp4')) &&
    !img.mimeType?.startsWith('audio/') &&
    !['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => img.fileName?.toLowerCase().endsWith(ext))
  )

  const serialized = videos.map((img: typeof videos[number]) => ({
    id: img.id,
    slug: img.slug,
    fileName: img.fileName,
    fileSizeMb: img.fileSizeMb,
    mimeType: img.mimeType,
    telegramMsgId: img.telegramMsgId,
    createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : (img.createdAt?.toDate ? img.createdAt.toDate().toISOString() : new Date().toISOString())
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Videos</h1>
        <p className="text-sm text-[#555] mt-1">
          Manage and stream all your uploaded MP4 videos
        </p>
      </div>

      <UploadZone type="videos" />

      <VideoGrid videos={serialized} />
    </div>
  )
}
