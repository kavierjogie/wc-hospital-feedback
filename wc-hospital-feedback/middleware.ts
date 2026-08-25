import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const isProtectedRoute =
    pathname.startsWith('/feedback') ||
    pathname.startsWith('/my-feedback') ||
    pathname.startsWith('/admin')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing in middleware.')
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  let user = null
  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    console.error('Middleware: error during authentication check:', error)
  }

  // Protect patient routes
  if (
    (pathname.startsWith('/feedback') || pathname.startsWith('/my-feedback')) &&
    !user
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/feedback' && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/cron).*)',
  ],
}
