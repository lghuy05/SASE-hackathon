'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr' // <- FIXED IMPORT
import { useRouter } from 'next/navigation'
import InterestsSetupForm from '@/components/InterestsSetupForm'

export default function InterestsSetupPage() {
  const router = useRouter()

  // FIXED: Use createBrowserClient instead of createClientComponentClient
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      // Check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_profile_complete')
        .eq('id', session.user.id)
        .single()

      if (!profile?.is_profile_complete) {
        router.push('/profile/setup')
        return
      }

      // Check if interests are already set
      const { data: interests } = await supabase
        .from('user_interests')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)

      if (interests && interests.length > 0) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router, supabase])

  return <InterestsSetupForm />
}
