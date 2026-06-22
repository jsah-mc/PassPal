'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Contact, ContactFormData } from '@/lib/contacts/types'

interface ContactModalProps {
  onSave: (data: ContactFormData) => Promise<unknown>
  onClose: () => void
  initial?: Contact | null
}

export function ContactModal({
  onSave,
  onClose,
  initial = null,
}: ContactModalProps) {
  const editing = Boolean(initial)
  const [form, setForm] = React.useState<ContactFormData>({
    first_name: initial?.first_name ?? '',
    last_name: initial?.last_name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    company: initial?.company ?? '',
    notes: initial?.notes ?? '',
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function setField(field: keyof ContactFormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-6 shadow-xl"
        role="dialog"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Contact</p>
            <h2 className="text-xl font-bold">
              {editing ? 'Edit contact' : 'Add contact'}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              autoFocus
              autoComplete="given-name"
              maxLength={200}
              placeholder="First name"
              value={form.first_name}
              onChange={(event) => setField('first_name', event.target.value)}
              required
            />
            <Input
              autoComplete="family-name"
              maxLength={200}
              placeholder="Last name"
              value={form.last_name}
              onChange={(event) => setField('last_name', event.target.value)}
            />
          </div>
          <Input
            autoComplete="email"
            maxLength={320}
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
          />
          <Input
            autoComplete="tel"
            maxLength={100}
            placeholder="Phone"
            type="tel"
            value={form.phone}
            onChange={(event) => setField('phone', event.target.value)}
          />
          <Input
            autoComplete="organization"
            maxLength={200}
            placeholder="Company"
            value={form.company}
            onChange={(event) => setField('company', event.target.value)}
          />
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            maxLength={5000}
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
