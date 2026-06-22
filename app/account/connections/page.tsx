'use client'

import * as React from 'react'
import type { Provider, UserIdentity } from '@supabase/supabase-js'
import { Github, Link2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSupabase } from '@/integrations/supabase/provider'

const providers = [
  { id: 'google' as const, name: 'Google' },
  { id: 'github' as const, name: 'GitHub' },
]

export default function ConnectionsPage() {
  const { supabase, user, isLoading, refreshUser } = useSupabase()
  const [pending, setPending] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)

  const identities = user?.identities ?? []

  async function connect(provider: Provider) {
    setPending(provider)
    setMessage(null)

    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/connections`,
      },
    })

    if (error) {
      setPending(null)
      setMessage(error.message)
    }
  }

  async function disconnect(identity: UserIdentity) {
    setPending(identity.id)
    setMessage(null)

    const { error } = await supabase.auth.unlinkIdentity(identity)
    setPending(null)

    if (error) {
      setMessage(error.message)
      return
    }

    await refreshUser()
    setMessage(`${identity.provider} disconnected.`)
  }

  if (isLoading || !user) {
    return <div className="h-72 animate-pulse rounded-xl bg-muted" />
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">Connected accounts</h2>
        <p className="text-sm text-muted-foreground">
          Link social providers so you can use them to sign in to this account.
        </p>
      </div>

      {message && (
        <p className="mt-5 rounded-md bg-muted p-3 text-sm">{message}</p>
      )}

      <div className="mt-6 space-y-3">
        {providers.map((provider) => {
          const identity = identities.find(
            (item) => item.provider === provider.id,
          )

          return (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              key={provider.id}
            >
              <div className="flex items-center gap-3">
                {provider.id === 'github' ? (
                  <Github className="size-5" />
                ) : (
                  <GoogleIcon />
                )}
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {identity ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {identity ? (
                <Button
                  disabled={pending !== null || identities.length <= 1}
                  variant="outline"
                  onClick={() => disconnect(identity)}
                >
                  {pending === identity.id ? 'Disconnecting…' : 'Disconnect'}
                </Button>
              ) : (
                <Button
                  disabled={pending !== null}
                  onClick={() => connect(provider.id)}
                >
                  <Link2 />
                  {pending === provider.id ? 'Connecting…' : 'Connect'}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Supabase prevents removing the final identity. Manual identity linking
        must also be enabled for this project in the Supabase Auth settings.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.61A10 10 0 0 0 12 22"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.29.31-1.88V7.51H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.49z"
      />
      <path
        fill="#EA4335"
        d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.51l3.34 2.61C7.18 7.75 9.39 5.99 12 5.99"
      />
    </svg>
  )
}
