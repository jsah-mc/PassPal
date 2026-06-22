'use client'

import * as React from 'react'
import {
  Clipboard,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import { PasswordEntryModal } from '@/components/password-entry-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePasswordEntries } from '@/hooks/use-password-entries'
import { useSupabase } from '@/integrations/supabase/provider'
import type { PasswordEntry } from '@/lib/password-vault/types'

type ModalState =
  | { mode: 'add' }
  | { mode: 'edit'; entry: PasswordEntry }
  | null

export default function DashboardPage() {
  const { supabase, user, isLoading } = useSupabase()
  const [password, setPassword] = React.useState('')
  const [vaultKey, setVaultKey] = React.useState('')
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [unlockError, setUnlockError] = React.useState<string | null>(null)

  async function unlockVault(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user?.email) {
      setUnlockError('Your account does not have an email address.')
      return
    }

    setIsVerifying(true)
    setUnlockError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    })

    setIsVerifying(false)

    if (error) {
      setUnlockError(
        'That account password is incorrect. Accounts created with Google, GitHub, or an email code must set a password before using the vault.',
      )
      return
    }

    setVaultKey(password)
    setPassword('')
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-md p-4 pt-16">
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </section>
    )
  }

  if (!vaultKey) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-md items-center p-4 pt-16">
        <div className="w-full rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <p className="mt-5 text-sm font-medium text-primary">
            Encrypted vault
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            Confirm your account password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the password for <strong>{user?.email}</strong>. Supabase
            verifies it before the vault unlocks, and it becomes the local
            encryption key for your entries.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Changing or resetting this password will prevent existing entries
            from being decrypted until they are re-encrypted with the new one.
          </p>
          <form className="mt-6 space-y-4" onSubmit={unlockVault}>
            <Input
              autoComplete="current-password"
              placeholder="Account password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {unlockError && (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {unlockError}
              </p>
            )}

            <Button className="w-full" disabled={isVerifying} type="submit">
              {isVerifying ? 'Verifying…' : 'Verify and unlock'}
            </Button>
          </form>
        </div>
      </section>
    )
  }

  return (
    <Vault
      masterPassword={vaultKey}
      onLock={() => {
        setVaultKey('')
        setPassword('')
        setUnlockError(null)
      }}
    />
  )
}

function Vault({
  masterPassword,
  onLock,
}: {
  masterPassword: string
  onLock: () => void
}) {
  const {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    revealPassword,
  } = usePasswordEntries(masterPassword)
  const [modal, setModal] = React.useState<ModalState>(null)
  const [revealed, setRevealed] = React.useState<Record<number, string>>({})
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState<number | null>(null)
  const [search, setSearch] = React.useState('')
  const [deleting, setDeleting] = React.useState<number | null>(null)

  async function handleReveal(entry: PasswordEntry) {
    if (revealed[entry.id]) {
      setRevealed((current) => {
        const next = { ...current }
        delete next[entry.id]
        return next
      })
      return
    }

    try {
      setActionError(null)
      const plaintext = await revealPassword(entry)
      setRevealed((current) => ({ ...current, [entry.id]: plaintext }))
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to decrypt.',
      )
    }
  }

  async function handleCopy(entry: PasswordEntry) {
    try {
      setActionError(null)
      const plaintext = revealed[entry.id] ?? (await revealPassword(entry))
      await navigator.clipboard.writeText(plaintext)
      setCopied(entry.id)
      window.setTimeout(() => setCopied(null), 1500)
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to copy.',
      )
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this password entry?')) {
      return
    }

    setDeleting(id)
    setActionError(null)

    try {
      await deleteEntry(id)
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to delete.',
      )
    } finally {
      setDeleting(null)
    }
  }

  const filteredEntries = entries.filter(
    (entry) =>
      entry.site_name.toLowerCase().includes(search.toLowerCase()) ||
      (entry.username ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <section className="mx-auto w-full max-w-5xl p-4 pt-16 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Encrypted vault</p>
          <h1 className="text-2xl font-bold tracking-tight">Your passwords</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onLock}>
            Lock
          </Button>
          <Button onClick={() => setModal({ mode: 'add' })}>
            <Plus />
            Add entry
          </Button>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search sites or usernames…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {(error || actionError) && (
        <p className="mb-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {actionError ?? error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">Loading…</p>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <KeyRound className="mx-auto size-9 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {search
              ? 'No entries match your search.'
              : 'No entries yet. Add your first password.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <article
              className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
              key={entry.id}
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{entry.site_name}</p>
                {entry.username && (
                  <p className="truncate text-sm text-muted-foreground">
                    {entry.username}
                  </p>
                )}
                <p className="mt-2 break-all font-mono text-sm text-primary">
                  {revealed[entry.id] ?? '••••••••••••'}
                </p>
                {entry.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.notes}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  aria-label={
                    revealed[entry.id] ? 'Hide password' : 'Reveal password'
                  }
                  size="icon"
                  variant="ghost"
                  onClick={() => handleReveal(entry)}
                >
                  {revealed[entry.id] ? <EyeOff /> : <Eye />}
                </Button>
                <Button
                  aria-label="Copy password"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleCopy(entry)}
                >
                  {copied === entry.id ? '✓' : <Clipboard />}
                </Button>
                <Button
                  aria-label="Edit entry"
                  size="icon"
                  variant="ghost"
                  onClick={() => setModal({ mode: 'edit', entry })}
                >
                  <Pencil />
                </Button>
                <Button
                  aria-label="Delete entry"
                  disabled={deleting === entry.id}
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal?.mode === 'add' && (
        <PasswordEntryModal onClose={() => setModal(null)} onSave={addEntry} />
      )}
      {modal?.mode === 'edit' && (
        <PasswordEntryModal
          initial={modal.entry}
          onClose={() => setModal(null)}
          onSave={(form) => updateEntry(modal.entry.id, form)}
        />
      )}
    </section>
  )
}
