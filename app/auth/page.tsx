'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Provider } from '@supabase/supabase-js'
import { Github } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/integrations/supabase/provider'

export default function AuthPage() {
  return (
    <React.Suspense
      fallback={
        <section className="mx-auto flex min-h-[70vh] w-full max-w-md items-center p-4 pt-16">
          <div className="h-96 w-full animate-pulse rounded-xl bg-muted" />
        </section>
      }
    >
      <AuthForm />
    </React.Suspense>
  )
}

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase, user } = useSupabase()
  const [isSignUp, setIsSignUp] = React.useState(
    searchParams.get('mode') === 'sign-up',
  )
  const [email, setEmail] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSendingCode, setIsSendingCode] = React.useState(false)
  const [oauthProvider, setOauthProvider] = React.useState<Provider | null>(
    null,
  )
  const [message, setMessage] = React.useState<string | null>(
    searchParams.get('error'),
  )
  const requestedNext = searchParams.get('next')
  const next =
    requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/'

  React.useEffect(() => {
    if (user) {
      router.replace(next)
    }
  }, [next, router, user])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password'))
    const fullName = String(formData.get('fullName') ?? '')

    const result = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password })

    setIsSubmitting(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    if (isSignUp && !result.data.session) {
      setMessage('Check your email to confirm your account.')
      return
    }

    router.replace(next)
    router.refresh()
  }

  async function sendSignInCode() {
    if (!email) {
      setMessage('Enter your email address first.')
      return
    }

    setIsSendingCode(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    setIsSendingCode(false)

    if (error) {
      setMessage(error.message)
      return
    }

    const params = new URLSearchParams({ email, next })
    router.push(`/auth/verify?${params.toString()}`)
  }

  async function signInWithOAuth(provider: 'google' | 'github') {
    setOauthProvider(provider)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setOauthProvider(null)
      setMessage(error.message)
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-md items-center p-4 pt-16">
      <div className="w-full rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">PassPal</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignUp
            ? 'Create an account with your email and a secure password.'
            : 'Sign in to access your vault.'}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            disabled={oauthProvider !== null}
            onClick={() => signInWithOAuth('google')}
          >
            <GoogleIcon />
            {oauthProvider === 'google' ? 'Redirecting…' : 'Google'}
          </Button>
          <Button
            variant="outline"
            disabled={oauthProvider !== null}
            onClick={() => signInWithOAuth('github')}
          >
            <Github />
            {oauthProvider === 'github' ? 'Redirecting…' : 'GitHub'}
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase text-muted-foreground">
            or continue with email
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <Input
              name="fullName"
              placeholder="Full name"
              autoComplete="name"
              required
            />
          )}
          <Input
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength={8}
            required
          />

          {message && (
            <p className="rounded-md bg-muted p-3 text-sm">{message}</p>
          )}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? 'Please wait…'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </Button>

          {!isSignUp && (
            <Button
              className="w-full"
              variant="outline"
              disabled={isSendingCode || isSubmitting}
              type="button"
              onClick={sendSignInCode}
            >
              {isSendingCode ? 'Sending code…' : 'Email me a sign-in code'}
            </Button>
          )}
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            className="text-primary underline-offset-4 hover:underline"
            type="button"
            onClick={() => {
              setIsSignUp((value) => !value)
              setMessage(null)
            }}
          >
            {isSignUp ? 'Already have an account?' : 'Need an account?'}
          </button>
          <Link
            className="text-muted-foreground hover:text-foreground"
            href="/"
          >
            Back home
          </Link>
        </div>
      </div>
    </section>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.61A10 10 0 0 0 12 22"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.29.31-1.88V7.51H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.49z"
      />
      <path
        fill="#EA4335"
        d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.51l3.34 2.61C7.18 7.75 9.39 5.99 12 5.99"
      />
    </svg>
  )
}
