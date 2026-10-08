import Link from "next/link";
import { SignOutButton } from "@/components/global/SignOut";
import { Inter } from 'next/font/google'
import { getCurrentUser } from "@/lib/auth";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "./loading";
import { NavLink } from "@/components/dashboard/NavLink";
import MobileNav from "@/components/dashboard/MobileNav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies()
  if (cookieStore.get('dashboard_access')?.value !== 'true') {
    redirect('/')
  }

  const { session, user } = await getCurrentUser()

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans ${inter.variable}`}>
      {/* Mobile Navigation Header & Bottom Nav */}
      <MobileNav session={session} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-[#111111] border-r border-white/[0.06] flex-col">

        {/* Logo */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#0a0a0a"/>
              </svg>
            </div>
            <span className="font-semibold text-sm text-white">Tofsir CDN</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            {
              href: "/dashboard",
              label: "Overview",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              ),
            },
            {
              href: "/dashboard/images",
              label: "Images",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              ),
            },
            {
              href: "/dashboard/videos",
              label: "Videos",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              ),
            },
            {
              href: "/dashboard/audio",
              label: "Audio",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              ),
            },
            {
              href: "/dashboard/api-keys",
              label: "API Keys",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              ),
            },
            {
              href: "/dashboard/api-tester",
              label: "API Key Tester",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              ),
            },
            {
              href: "/dashboard/telegram",
              label: "Telegram ID",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                </svg>
              ),
            },
            {
              href: "/dashboard/docs",
              label: "Docs",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              ),
            },
          ].map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </nav>
        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          <div className="flex gap-2 px-3">
            <Link href="/terms" className="text-xs text-[#555] hover:text-[#888] transition-colors">Terms</Link>
            <span className="text-[#333]">·</span>
            <Link href="/privacy" className="text-xs text-[#555] hover:text-[#888] transition-colors">Privacy</Link>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/[0.04] transition-colors">
            {session.user.image ? (
             <Image src={session.user.image} width={24} height={24} className="rounded-full" alt="avatar" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                {session.user.name?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#ccc] truncate">{session.user.name}</p>
              <p className="text-xs text-[#555] truncate">{session.user.email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-56 min-h-screen pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <Suspense fallback={<Loading/>}>
          {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
