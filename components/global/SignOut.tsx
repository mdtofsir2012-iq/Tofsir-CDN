'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SignOutButton() {
  const router = useRouter()

  function handleLogout() {
    // Clear both old and new access cookies
    document.cookie = "auth_pin=; path=/; max-age=0";
    document.cookie = "dashboard_access=; path=/; max-age=0";

    toast.success("Locked dashboard successfully!")
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-red-400 hover:text-white hover:bg-red-500/20 transition-all font-medium mt-2"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      Lock Dashboard
    </button>
  )
}
