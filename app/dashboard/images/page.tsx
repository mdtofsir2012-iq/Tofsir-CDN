import UploadZone from '@/components/dashboard/UploadZone'
import ImageGrid from '@/components/dashboard/ImageGrid'
import { getImagesData } from '@/lib/dashboard-data'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export default async function ImagesPage() {
  const { user } = await getCurrentUser()
  const images = await getImagesData(user.id)

  const serialized = images.map((img: typeof images[number]) => ({
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
        <h1 className="text-xl font-semibold text-white">Images</h1>
        <p className="text-sm text-[#555] mt-1">
          Manage and view all your uploaded images
        </p>
      </div>

      <UploadZone type="images" />

      <ImageGrid images={serialized} />
    </div>
  )
}
