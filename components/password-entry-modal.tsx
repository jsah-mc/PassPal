'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { EntryFormData, PasswordEntry } from '@/lib/password-vault/types'

interface PasswordEntryModalProps {
  onSave: (data: EntryFormData) => Promise<unknown>
  onClose: () => void
  initial?: PasswordEntry | null
}

export function PasswordEntryModal({
  onSave,
  onClose,
  initial = null,
}: PasswordEntryModalProps) {
  const editing = Boolean(initial)
  const [form, setForm] = React.useState<EntryFormData>({
    site_name: initial?.site_name ?? '',
    username: initial?.username ?? '',
    password: '',
    notes: initial?.notes ?? '',
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function setField(field: keyof EntryFormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editing && !form.password) {
      setError('Password is required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSave(form)
      onClose()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Unable to save.',
      )
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
        role="dialog"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Vault entry</p>
            <h2 className="text-xl font-bold">
              {editing ? 'Edit password' : 'Add password'}
            </h2>
          </div>
          <Button
            aria-label="Close"
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            autoFocus
            placeholder="Site name"
            value={form.site_name}
            onChange={(event) => setField('site_name', event.target.value)}
            required
          />
          <Input
            autoComplete="username"
            placeholder="Username or email"
            value={form.username}
            onChange={(event) => setField('username', event.target.value)}
          />
          <Input
            autoComplete="new-password"
            placeholder={
              editing ? 'New password (leave blank to keep)' : 'Password'
            }
            type="password"
            value={form.password}
            onChange={(event) => setField('password', event.target.value)}
            required={!editing}
          />
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setField('notes', event.target.value)}
          />

          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
