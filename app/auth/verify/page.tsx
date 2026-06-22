'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MailCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/integrations/supabase/provider'

export default function VerifyPage() {
  return (
    <React.Suspense
      fallback={
        <section className="mx-auto flex min-h-[70vh] w-full max-w-md items-center p-4 pt-16">
          <div className="h-96 w-full animate-pulse rounded-xl bg-muted" />
        </section>
      }
    >
      <VerifyCodeForm />
    </React.Suspense>
  )
}

function VerifyCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase, user } = useSupabase()
  const email = searchParams.get('email') ?? ''
  const requestedNext = searchParams.get('next')
  const next =
    requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/'
  const [code, setCode] = React.useState('')
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isResending, setIsResending] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [resendDelay, setResendDelay] = React.useState(60)

  React.useEffect(() => {
    if (user) {
      router.replace(next)
    }
  }, [next, router, user])

  React.useEffect(() => {
    if (resendDelay <= 0) {
      return
    }

    const timer = window.setTimeout(
      () => setResendDelay((value) => value - 1),
      1000,
    )

    return () => window.clearTimeout(timer)
  }, [resendDelay])

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email) {
      setMessage('Your email address is missing. Request a new code.')
      return
    }

    setIsVerifying(true)
    setMessage(null)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    setIsVerifying(false)

    if (error) {
      setMessage(error.message)
      return
    }

    router.replace(next)
    router.refresh()
  }

  async function resendCode() {
    if (!email) {
      setMessage('Your email address is missing. Request a new code.')
      return
    }

    setIsResending(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    setIsResending(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setResendDelay(60)
    setMessage('A new code was sent.')
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-md items-center p-4 pt-16">
      <div className="w-full rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <p className="mt-5 text-sm font-medium text-primary">
          Check your email
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Enter your sign-in code
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a six-digit code to{' '}
          <span className="font-medium text-foreground">
            {email || 'your email address'}
          </span>
          .
        </p>

        <form className="mt-6 space-y-4" onSubmit={verifyCode}>
          <Input
            className="h-12 text-center text-xl font-semibold tracking-[0.5em]"
            aria-label="Six-digit sign-in code"
            autoComplete="one-time-code"
            autoFocus
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="000000"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            required
          />

          {message && (
            <p className="rounded-md bg-muted p-3 text-sm">{message}</p>
          )}

          <Button
            className="w-full"
            disabled={isVerifying || code.length !== 6}
            type="submit"
          >
            {isVerifying ? 'Verifying…' : 'Verify and sign in'}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Button
            className="h-auto p-0"
            variant="link"
            disabled={isResending || resendDelay > 0}
            onClick={resendCode}
          >
            {isResending
              ? 'Sending…'
              : resendDelay > 0
                ? `Resend in ${resendDelay}s`
                : 'Resend code'}
          </Button>
          <Link
            className="text-muted-foreground hover:text-foreground"
            href={`/auth?next=${encodeURIComponent(next)}`}
          >
            Use another method
          </Link>
        </div>
      </div>
    </section>
  )
}
