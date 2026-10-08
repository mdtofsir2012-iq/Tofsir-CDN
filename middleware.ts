import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the user is trying to access any route under /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const hasAccess = request.cookies.get('dashboard_access')?.value === 'true'

    // If they don't have the correct cookie, redirect them to the home page (where the PIN modal is)
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/dashboard/:path*',
}
