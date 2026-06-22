# PassPal

PassPal is the Next.js rebuild of the original `psmgr` password manager shell.

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.

## Environment

Copy `.env.example` to `.env.local` and provide the Supabase project URL and
publishable key. Enable Email, Google, and GitHub authentication in the Supabase
dashboard. Add `/auth/callback` for each deployed app URL to the Supabase Auth
redirect allow list.

For six-digit email sign-in codes, update the Supabase **Magic Link** email
template to include the token:

```html
<h2>Your PassPal sign-in code</h2>
<p>Enter this code to sign in: {{ .Token }}</p>
```

## Password vault

Run [`supabase/password_entries.sql`](supabase/password_entries.sql) in the
Supabase SQL editor before opening `/dashboard`. The script creates the vault
table, grants authenticated access, and applies ownership-based RLS policies.

Vault passwords are encrypted in the browser with AES-GCM. Opening the vault
requires re-entering the signed-in user's Supabase account password. Supabase
verifies the password, then the browser keeps it in memory as the encryption
key.

Google, GitHub, and email-code-only accounts need to set a password before they
can use the vault. Changing or resetting an account password makes entries
encrypted with the previous password unreadable until they are re-encrypted.
