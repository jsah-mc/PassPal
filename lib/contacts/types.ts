export interface Contact {
  id: string
  user_id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ContactFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string
  notes: string
}
