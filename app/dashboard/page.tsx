import { getCurrentUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { session } = await getCurrentUser();
  const userId = "admin";

  const [keysSnap, imagesSnap] = await Promise.all([
    adminDb.collection("apiKeys").where("userId", "==", userId).orderBy("createdAt", "desc").get(),
    adminDb.collection("images").where("userId", "==", userId).orderBy("createdAt", "desc").get(),
  ]);

  const apiKeys = keysSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
  const images = imagesSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

  let totalSizeMb = 0;
  images.forEach(img => {
    if (typeof img.fileSizeMb === 'number') totalSizeMb += img.fileSizeMb;
  });

  const userData = {
    name: "Admin",
    email: "admin@imgstorage.local",
  };

  const user = {
    ...userData,
    apiKeys,
    images: images.slice(0, 8),
    _count: { images: images.length }
  };

  const totalImages = user._count.images;
  const totalUsage = user.apiKeys.reduce(
    (sum: number, k: any) => sum + (k.usageCount || 0),
    0,
  );
  const stats = [
    {
      label: "Total Images",
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
      value: totalUsage.toLocaleString(),
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
          , {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-[#555] mt-1">
          Here's what's happening with your images today
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
          <Link
            href="/dashboard/images"
            className="text-xs text-[#666] hover:text-white transition-colors"
          >
            View all →
          </Link>
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
              <p className="text-sm font-medium text-[#ccc]">No images yet</p>
              <p className="text-xs text-[#555] mt-0.5">
                Upload your first image to get started
              </p>
            </div>
            <Link
              href="/dashboard/images"
              className="inline-block bg-white text-black text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Upload image
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {recentUploads.map((img: any) => (
              <div
                key={img.id}
                className="group bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.15] transition-all"
              >
                <div className="aspect-square bg-white/[0.02] relative overflow-hidden flex items-center justify-center">
                  <Image
                    src={`/i/${img.slug}`}
                    alt={img.fileName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium text-[#ccc] truncate">
                    {img.fileName}
                  </p>
                  <p className="text-[11px] text-[#555]">
                    {img.fileSizeMb} MB ·{" "}
                    {new Date(img.createdAt?.toDate?.() || img.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
