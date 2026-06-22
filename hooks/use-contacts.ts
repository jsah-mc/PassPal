'use client'

import * as React from 'react'

import { useSupabase } from '@/integrations/supabase/provider'
import type { Contact, ContactFormData } from '@/lib/contacts/types'

function compareContacts(a: Contact, b: Contact) {
  const firstNameComparison = a.first_name.localeCompare(b.first_name)

  if (firstNameComparison !== 0) {
    return firstNameComparison
  }

  return (a.last_name ?? '').localeCompare(b.last_name ?? '')
}

function contactPayload(form: ContactFormData) {
  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    company: form.company.trim() || null,
    notes: form.notes.trim() || null,
  }
}

export function useContacts() {
  const { supabase, user } = useSupabase()
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchContacts = React.useCallback(async () => {
    if (!user) {
      setContacts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: queryError } = await supabase
      .from('contacts')
      .select('*')
      .order('first_name', { ascending: true })
      .order('last_name', { ascending: true })

    if (queryError) {
      setError(queryError.message)
    } else {
      setContacts(((data ?? []) as Contact[]).sort(compareContacts))
    }

    setLoading(false)
  }, [supabase, user])

  React.useEffect(() => {
    let cancelled = false

    if (!user) {
      return
    }

    void supabase
      .from('contacts')
      .select('*')
      .order('first_name', { ascending: true })
      .order('last_name', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (cancelled) {
          return
        }

        if (queryError) {
          setError(queryError.message)
        } else {
          setContacts(((data ?? []) as Contact[]).sort(compareContacts))
        }

        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [supabase, user])

  async function addContact(form: ContactFormData): Promise<Contact> {
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data, error: queryError } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        ...contactPayload(form),
      })
      .select()
      .single()

    if (queryError) {
      throw new Error(queryError.message)
    }

    const contact = data as Contact
    setContacts((current) => [...current, contact].sort(compareContacts))
    return contact
  }

  async function updateContact(
    id: string,
    form: ContactFormData,
  ): Promise<Contact> {
    const { data, error: queryError } = await supabase
      .from('contacts')
      .update(contactPayload(form))
      .eq('id', id)
      .select()
      .single()

    if (queryError) {
      throw new Error(queryError.message)
    }

    const contact = data as Contact
    setContacts((current) =>
      current
        .map((item) => (item.id === id ? contact : item))
        .sort(compareContacts),
    )
    return contact
  }

  async function deleteContact(id: string): Promise<void> {
    const { error: queryError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (queryError) {
      throw new Error(queryError.message)
    }

    setContacts((current) => current.filter((contact) => contact.id !== id))
  }

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  }
}
