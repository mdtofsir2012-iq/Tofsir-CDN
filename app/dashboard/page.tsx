import { getCurrentUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { Play, Music } from "lucide-react";
import RealtimeViewCount from "@/components/dashboard/RealtimeViewCount";
import { RealtimeTotalViews, RealtimeTotalUsage } from "@/components/dashboard/RealtimeTotalStats";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { session } = await getCurrentUser();
  const userId = "admin";

  const [keysSnap, imgSnap, vidSnap, audSnap] = await Promise.all([
    adminDb.collection("apiKeys").where("userId", "==", userId).orderBy("createdAt", "desc").get(),
    adminDb.collection("images").where("userId", "==", userId).get(),
    adminDb.collection("videos").where("userId", "==", userId).get(),
    adminDb.collection("audios").where("userId", "==", userId).get(),
  ]);

  const apiKeys = keysSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

  const allMedia = [
    ...imgSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })),
    ...vidSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })),
    ...audSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })),
  ];

  allMedia.sort((a, b) => {
    const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
    const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
    return tB - tA;
  });

  let totalSizeMb = 0;
  let totalViews = 0;
  allMedia.forEach(img => {
    if (typeof img.fileSizeMb === 'number') totalSizeMb += img.fileSizeMb;
    if (typeof img.views === 'number') totalViews += img.views;
  });

  const userData = {
    name: "Admin",
    email: "admin@imgstorage.local",
  };

  const user = {
    ...userData,
    apiKeys,
    images: allMedia.slice(0, 8), // Show latest 8 items
    _count: { images: allMedia.length }
  };

  const totalImages = user._count.images;
  const totalUsage = user.apiKeys.reduce(
    (sum: number, k: any) => sum + (k.usageCount || 0),
    0,
  );
  const stats = [
    {
      label: "Total Uploads",
      value: totalImages.toLocaleString(),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#888]"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      label: "Total Storage",
      value: `${totalSizeMb.toFixed(1)} MB`,
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#888]"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      label: "API Requests",
      value: <RealtimeTotalUsage initialTotal={totalUsage} />,
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#888]"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Active Keys",
      value: user.apiKeys.length.toString(),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#888]"
        >
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      ),
    },
    {
      label: "Total Views",
      value: <RealtimeTotalViews initialTotal={totalViews} />,
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#888]"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  const recentUploads = user.images;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-semibold text-white">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
            ? "afternoon"
            : "evening"}
          , {session.user.name?.split(" ")[0] || "Admin"} 👋
        </h1>
        <p className="text-sm text-[#555] mt-1">
          Here's what's happening with your media today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#111] border border-white/[0.06] rounded-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#666]">
                {stat.label}
              </span>
              <div className="w-7 h-7 bg-white/[0.04] rounded-lg flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-semibold text-white tracking-tight">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Uploads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Recent Uploads</h2>
        </div>

        {recentUploads.length === 0 ? (
          <div className="bg-[#111] border border-white/[0.06] rounded-xl p-12 text-center space-y-3">
            <div className="w-10 h-10 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto text-[#666]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#ccc]">No media yet</p>
              <p className="text-xs text-[#555] mt-0.5">
                Upload your first image, video, or audio to get started
              </p>
            </div>
            <Link
              href="/dashboard/images"
              className="inline-block bg-white text-black text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Upload media
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {recentUploads.map((img: any) => {
              const isVideo = img.mimeType === 'video/mp4' || img.fileName?.toLowerCase().endsWith('.mp4');
              const isAudio = img.mimeType?.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => img.fileName?.toLowerCase().endsWith(ext));
              const collectionName = isVideo ? 'videos' : isAudio ? 'audios' : 'images';

              return (
                <Link
                  href={isAudio ? '/dashboard/audio' : isVideo ? '/dashboard/videos' : '/dashboard/images'}
                  key={img.id}
                  className="group bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.15] transition-all block"
                >
                  <div className="aspect-square bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
                    {isAudio ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#121212] group-hover:bg-[#161616] transition-colors">
                        <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-110 transition-transform">
                          <Music className="w-6 h-6" />
                        </div>
                      </div>
                    ) : isVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          src={`/i/${img.slug}?thumbnail=true`}
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-lg">
                            <Play className="w-4 h-4 ml-0.5 fill-current" />
                          </div>
                        </div>
                      </div>
                    ) : img.mimeType === 'image/gif' || img.fileName?.toLowerCase().endsWith('.gif') ? (
                      <video
                        src={`/i/${img.slug}?thumbnail=true`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/i/${img.slug}?thumbnail=true`}
                        alt={img.fileName || 'Media'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-3 bg-[#0d0d0d] border-t border-white/[0.06] flex items-center justify-between">
                    <p className="text-xs font-medium text-[#ccc] truncate group-hover:text-white transition-colors flex-1 pr-2" title={img.fileName}>
                      {img.fileName ? img.fileName.replace(/\.[^/.]+$/, '') : ''}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#555] shrink-0">
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <RealtimeViewCount
                          docId={img.id}
                          collectionName={collectionName}
                          initialViews={img.views || 0}
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
