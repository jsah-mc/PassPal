import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next')
  const next =
    requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'

      if (process.env.NODE_ENV === 'development' || !forwardedHost) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      return NextResponse.redirect(
        `${forwardedProto}://${forwardedHost}${next}`,
      )
    }
  }

  const errorUrl = new URL('/auth', origin)
  errorUrl.searchParams.set(
    'error',
    'Google or GitHub sign-in could not be completed.',
  )

  return NextResponse.redirect(errorUrl)
}
