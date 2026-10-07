'use client'

import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  function handleLogout() {
    document.cookie = "auth_pin=; path=/; max-age=0";
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-[#555] hover:text-white hover:bg-white/[0.06] transition-all"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Sign out
    </button>
  )
}
