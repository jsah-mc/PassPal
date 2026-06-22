'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useSupabase } from '@/integrations/supabase/provider'

export function HomeAuthActions() {
  const { supabase, user, isLoading } = useSupabase()

  if (isLoading) {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
  }

  if (user) {
    return (
      <Button variant="outline" onClick={() => supabase.auth.signOut()}>
        Sign out
      </Button>
    )
  }

  return (
    <>
      <Button asChild variant="outline">
        <Link href="/auth">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/auth?mode=sign-up">Create account</Link>
      </Button>
    </>
  )
}
