'use client'

import * as React from 'react'

import { decryptPassword, encryptPassword } from '@/lib/password-vault/crypto'
import type { EntryFormData, PasswordEntry } from '@/lib/password-vault/types'
import { useSupabase } from '@/integrations/supabase/provider'

export function usePasswordEntries(masterPassword: string) {
  const { supabase, user } = useSupabase()
  const [entries, setEntries] = React.useState<PasswordEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchEntries = React.useCallback(async () => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: queryError } = await supabase
      .from('password_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (queryError) {
      setError(queryError.message)
    } else {
      setEntries((data ?? []) as PasswordEntry[])
    }

    setLoading(false)
  }, [supabase, user])

  React.useEffect(() => {
    let cancelled = false

    if (!user) {
      return
    }

    void supabase
      .from('password_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (cancelled) {
          return
        }

        if (queryError) {
          setError(queryError.message)
        } else {
          setEntries((data ?? []) as PasswordEntry[])
        }

        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [supabase, user])

  async function addEntry(form: EntryFormData): Promise<PasswordEntry> {
    if (!user) {
      throw new Error('Not authenticated')
    }

    const encrypted = await encryptPassword(form.password, masterPassword)
    const { data, error: queryError } = await supabase
      .from('password_entries')
      .insert({
        user_id: user.id,
        site_name: form.site_name,
        username: form.username || null,
        notes: form.notes || null,
        ...encrypted,
      })
      .select()
      .single()

    if (queryError) {
      throw new Error(queryError.message)
    }

    const entry = data as PasswordEntry
    setEntries((current) => [entry, ...current])
    return entry
  }

  async function updateEntry(
    id: number,
    form: EntryFormData,
  ): Promise<PasswordEntry> {
    const patch: Partial<PasswordEntry> = {
      site_name: form.site_name,
      username: form.username || null,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    }

    if (form.password) {
      Object.assign(patch, await encryptPassword(form.password, masterPassword))
    }

    const { data, error: queryError } = await supabase
      .from('password_entries')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (queryError) {
      throw new Error(queryError.message)
    }

    const entry = data as PasswordEntry
    setEntries((current) =>
      current.map((item) => (item.id === id ? entry : item)),
    )
    return entry
  }

  async function deleteEntry(id: number): Promise<void> {
    const { error: queryError } = await supabase
      .from('password_entries')
      .delete()
      .eq('id', id)

    if (queryError) {
      throw new Error(queryError.message)
    }

    setEntries((current) => current.filter((entry) => entry.id !== id))
  }

  function revealPassword(entry: PasswordEntry): Promise<string> {
    return decryptPassword(entry, masterPassword)
  }

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    revealPassword,
    refetch: fetchEntries,
  }
}
