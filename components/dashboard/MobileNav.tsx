'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Image as ImageIcon, Film, Key, Menu, X, Music, Sliders, Send, BookOpen, LogOut } from 'lucide-react'
import { SignOutButton } from '@/components/global/SignOut'

export default function MobileNav({ session }: { session: any }) {
  const [showMore, setShowMore] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/images', label: 'Images', icon: ImageIcon },
    { href: '/dashboard/videos', label: 'Videos', icon: Film },
    { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  ]

  const moreItems = [
    { href: '/dashboard/audio', label: 'Audio', icon: Music },
    { href: '/dashboard/api-tester', label: 'API Key Tester', icon: Sliders },
    { href: '/dashboard/telegram', label: 'Telegram ID', icon: Send },
    { href: '/dashboard/docs', label: 'Docs', icon: BookOpen },
  ]

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[#111111] border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#0a0a0a"/>
            </svg>
          </div>
          <span className="font-semibold text-sm text-white">Tofsir CDN</span>
        </div>
        <div className="text-xs text-[#888]">
          {session?.user?.name || 'Admin'}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#111111] border-t border-white/[0.06] z-50 flex items-center justify-around py-2 px-1 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs transition-colors ${
                isActive ? 'text-blue-400 font-medium' : 'text-[#888] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <button
          onClick={() => setShowMore(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs transition-colors ${
            showMore ? 'text-blue-400 font-medium' : 'text-[#888] hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* More Modal / Sheet */}
      {showMore && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#141414] border-t border-white/10 rounded-t-2xl p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">More Options</h3>
              <button
                onClick={() => setShowMore(false)}
                className="text-[#888] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                        : 'bg-[#1a1a1a] border-white/[0.06] text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-white/[0.06] pt-4 space-y-3">
              <div className="flex justify-between text-xs text-[#888] px-1">
                <Link href="/terms" onClick={() => setShowMore(false)} className="hover:text-white">Terms</Link>
                <Link href="/privacy" onClick={() => setShowMore(false)} className="hover:text-white">Privacy</Link>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
