export interface PasswordEntry {
  id: number
  user_id: string
  site_name: string
  username: string | null
  encrypted_password: string
  iv: string
  kdf_salt: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface EntryFormData {
  site_name: string
  username: string
  password: string
  notes: string
}
