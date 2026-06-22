'use client'

import * as React from 'react'
import {
  Building2,
  Clipboard,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from 'lucide-react'

import { ContactModal } from '@/components/contact-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContacts } from '@/hooks/use-contacts'
import type { Contact } from '@/lib/contacts/types'

type ModalState = { mode: 'add' } | { mode: 'edit'; contact: Contact } | null

function fullName(contact: Contact) {
  return [contact.first_name, contact.last_name].filter(Boolean).join(' ')
}

function initials(contact: Contact) {
  return `${contact.first_name[0] ?? ''}${contact.last_name?.[0] ?? ''}`.toUpperCase()
}

export default function ContactsPage() {
  const { contacts, loading, error, addContact, updateContact, deleteContact } =
    useContacts()
  const [modal, setModal] = React.useState<ModalState>(null)
  const [search, setSearch] = React.useState('')
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState<string | null>(null)

  const filteredContacts = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    if (!query) {
      return contacts
    }

    return contacts.filter((contact) =>
      [
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone,
        contact.company,
      ].some((value) => value?.toLocaleLowerCase().includes(query)),
    )
  }, [contacts, search])

  const groupedContacts = React.useMemo(() => {
    const groups = new Map<string, Contact[]>()

    for (const contact of filteredContacts) {
      const letter = contact.first_name.charAt(0).toLocaleUpperCase() || '#'
      groups.set(letter, [...(groups.get(letter) ?? []), contact])
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredContacts])

  async function handleCopy(value: string, key: string) {
    try {
      setActionError(null)
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      setActionError('Unable to copy to the clipboard.')
    }
  }

  async function handleDelete(contact: Contact) {
    if (!window.confirm(`Delete ${fullName(contact)}?`)) {
      return
    }

    setDeleting(contact.id)
    setActionError(null)

    try {
      await deleteContact(contact.id)
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to delete contact.',
      )
    } finally {
      setDeleting(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl p-4 pt-16 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Address book</p>
          <h1 className="text-2xl font-bold tracking-tight">Your contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {contacts.length} contact{contacts.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button onClick={() => setModal({ mode: 'add' })}>
          <Plus />
          Add contact
        </Button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search names, email, phone, or company…"
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
      ) : filteredContacts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <UsersRound className="mx-auto size-9 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {search
              ? 'No contacts match your search.'
              : 'No contacts yet. Add your first one.'}
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          {groupedContacts.map(([letter, group]) => (
            <section key={letter}>
              <div className="mb-2 border-b pb-2 text-xs font-bold tracking-[0.16em] text-primary">
                {letter}
              </div>
              <div className="space-y-3">
                {group.map((contact) => (
                  <article
                    className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
                    key={contact.id}
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials(contact)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {fullName(contact)}
                        </p>
                        {contact.company && (
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                            <Building2 className="size-3.5 shrink-0" />
                            {contact.company}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                          {contact.email && (
                            <button
                              className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                              title="Copy email"
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  contact.email!,
                                  `${contact.id}-email`,
                                )
                              }
                            >
                              <Mail className="size-3.5 shrink-0" />
                              <span className="truncate">{contact.email}</span>
                              {copied === `${contact.id}-email` ? (
                                <span className="text-xs text-primary">
                                  Copied
                                </span>
                              ) : (
                                <Clipboard className="size-3 shrink-0" />
                              )}
                            </button>
                          )}
                          {contact.phone && (
                            <button
                              className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                              title="Copy phone"
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  contact.phone!,
                                  `${contact.id}-phone`,
                                )
                              }
                            >
                              <Phone className="size-3.5 shrink-0" />
                              <span className="truncate">{contact.phone}</span>
                              {copied === `${contact.id}-phone` ? (
                                <span className="text-xs text-primary">
                                  Copied
                                </span>
                              ) : (
                                <Clipboard className="size-3 shrink-0" />
                              )}
                            </button>
                          )}
                        </div>
                        {contact.notes && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                            {contact.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1 self-end sm:self-auto">
                      <Button
                        aria-label={`Edit ${fullName(contact)}`}
                        size="icon"
                        variant="ghost"
                        onClick={() => setModal({ mode: 'edit', contact })}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        aria-label={`Delete ${fullName(contact)}`}
                        disabled={deleting === contact.id}
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(contact)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {modal?.mode === 'add' && (
        <ContactModal onClose={() => setModal(null)} onSave={addContact} />
      )}
      {modal?.mode === 'edit' && (
        <ContactModal
          initial={modal.contact}
          onClose={() => setModal(null)}
          onSave={(form) => updateContact(modal.contact.id, form)}
        />
      )}
    </section>
  )
}
