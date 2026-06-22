'use client'

import * as React from 'react'
import type { User } from '@supabase/supabase-js'

import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/integrations/supabase/provider'

type Theme = 'system' | 'light' | 'dark'

export default function ProfilePage() {
  const { user, isLoading } = useSupabase()

  if (isLoading || !user) {
    return <div className="h-72 animate-pulse rounded-xl bg-muted" />
  }

  return <ProfileForm key={user.id} user={user} />
}

function ProfileForm({ user }: { user: User }) {
  const { supabase, refreshUser } = useSupabase()
  const [fullName, setFullName] = React.useState(
    user.user_metadata.full_name ?? '',
  )
  const [avatarUrl, setAvatarUrl] = React.useState(
    user.user_metadata.avatar_url ?? user.user_metadata.picture ?? '',
  )
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'system'
    }

    const storedTheme = localStorage.getItem('theme')
    return storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : 'system'
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  function applyTheme(value: Theme) {
    setTheme(value)

    if (value === 'system') {
      localStorage.removeItem('theme')
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      document.documentElement.classList.toggle('dark', prefersDark)
      document.documentElement.classList.toggle('light', !prefersDark)
      return
    }

    localStorage.setItem('theme', value)
    document.documentElement.classList.toggle('dark', value === 'dark')
    document.documentElement.classList.toggle('light', value === 'light')
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || null,
      },
    })

    setIsSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    await refreshUser()
    setMessage('Profile saved.')
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_240px]">
      <form
        className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
        onSubmit={saveProfile}
      >
        <div>
          <h2 className="text-xl font-bold">Profile personalization</h2>
          <p className="text-sm text-muted-foreground">
            Customize how your account appears in PassPal.
          </p>
        </div>

        <label className="block space-y-2 text-sm font-medium">
          <span>Display name</span>
          <Input
            autoComplete="name"
            maxLength={100}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>

        <label className="block space-y-2 text-sm font-medium">
          <span>Profile picture URL</span>
          <Input
            inputMode="url"
            placeholder="https://example.com/avatar.jpg"
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
          />
        </label>

        <label className="block space-y-2 text-sm font-medium">
          <span>Appearance</span>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            suppressHydrationWarning
            value={theme}
            onChange={(event) => applyTheme(event.target.value as Theme)}
          >
            <option value="system">Use system setting</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        {message && (
          <p className="rounded-md bg-muted p-3 text-sm">{message}</p>
        )}

        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>

      <aside className="rounded-xl border bg-card p-6 text-center shadow-sm">
        <UserAvatar
          avatarUrl={avatarUrl}
          className="mx-auto size-24 text-2xl"
          name={fullName || user.email}
        />
        <p className="mt-4 truncate font-semibold">{fullName || user.email}</p>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
      </aside>
    </div>
  )
}
