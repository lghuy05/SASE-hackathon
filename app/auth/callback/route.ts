import { createServerClient } from '@supabase/ssr' // <- FIXED IMPORT
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // FIXED: Create Supabase client with the new method
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Exchange code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
    }

    if (session) {
      const user = session.user

      // Check if user has completed their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_profile_complete')
        .eq('id', user.id)
        .single()

      // If no profile exists or profile is incomplete, redirect to profile setup
      if (!profile || !profile.is_profile_complete) {
        return NextResponse.redirect(`${requestUrl.origin}/profile/setup`)
      }

      // Check if user has set their interests
      const { data: interests, error: interestsError } = await supabase
        .from('user_interests')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      // If no interests set, redirect to interests setup
      if (!interests || interests.length === 0) {
        return NextResponse.redirect(`${requestUrl.origin}/interests/setup`)
      }

      // User is fully set up, redirect to dashboard
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    }
  }

  // If no code or session, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}
