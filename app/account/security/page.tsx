'use client'

import * as React from 'react'
import { Laptop, LogOut, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/integrations/supabase/provider'

export default function SecurityPage() {
  const { supabase, user, isLoading } = useSupabase()
  const [sessionStartedAt, setSessionStartedAt] = React.useState<string | null>(
    null,
  )
  const [userAgent] = React.useState(() =>
    typeof navigator === 'undefined' ? 'Current browser' : navigator.userAgent,
  )
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isChanging, setIsChanging] = React.useState(false)
  const [isSigningOutOthers, setIsSigningOutOthers] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      const issuedAt = data.session?.user.last_sign_in_at
      setSessionStartedAt(issuedAt ?? null)
    })
  }, [supabase])

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage('The new passwords do not match.')
      return
    }

    setIsChanging(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      ...(currentPassword ? { currentPassword } : {}),
    })
    setIsChanging(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setMessage('Password updated.')
  }

  async function signOutOtherSessions() {
    setIsSigningOutOthers(true)
    setMessage(null)
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    setIsSigningOutOthers(false)
    setMessage(
      error ? error.message : 'Other active sessions have been signed out.',
    )
  }

  if (isLoading || !user) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 size-5 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Change or set password</h2>
            <p className="text-sm text-muted-foreground">
              OAuth and email-code accounts can set a password here.
            </p>
          </div>
        </div>

        <form className="mt-6 max-w-md space-y-4" onSubmit={changePassword}>
          <Input
            autoComplete="current-password"
            placeholder="Current password (if you have one)"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <Input
            autoComplete="new-password"
            minLength={8}
            placeholder="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <Input
            autoComplete="new-password"
            minLength={8}
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <p className="text-xs text-muted-foreground">
            Important: password-vault entries are encrypted with your current
            account password. Changing it will make existing entries unreadable
            until they are re-encrypted.
          </p>

          {message && (
            <p className="rounded-md bg-muted p-3 text-sm">{message}</p>
          )}

          <Button disabled={isChanging} type="submit">
            {isChanging ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold">Places you are signed in</h2>
        <p className="text-sm text-muted-foreground">
          Supabase exposes the current browser session here and lets you revoke
          all other sessions, but does not provide a client-side list of every
          device.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Laptop className="mt-1 size-5 text-primary" />
            <div>
              <p className="font-medium">This browser</p>
              <p
                className="text-sm text-muted-foreground"
                suppressHydrationWarning
              >
                {userAgent}
              </p>
              {sessionStartedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last signed in{' '}
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(sessionStartedAt))}
                </p>
              )}
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Current
          </span>
        </div>

        <Button
          className="mt-5"
          disabled={isSigningOutOthers}
          variant="outline"
          onClick={signOutOtherSessions}
        >
          <LogOut />
          {isSigningOutOthers ? 'Signing out…' : 'Sign out other sessions'}
        </Button>
      </div>
    </div>
  )
}
