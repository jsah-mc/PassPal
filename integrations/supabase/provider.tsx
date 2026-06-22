'use client'

import * as React from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/client'

type SupabaseContextValue = {
  supabase: SupabaseClient
  user: User | null
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const SupabaseContext = React.createContext<SupabaseContextValue | null>(null)

export function useSupabase() {
  const context = React.useContext(SupabaseContext)

  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider')
  }

  return context
}

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = React.useState(createClient)
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    void supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUser(data.user)
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const refreshUser = React.useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }, [supabase])

  const value = React.useMemo(
    () => ({ supabase, user, isLoading, refreshUser }),
    [supabase, user, isLoading, refreshUser],
  )

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}
