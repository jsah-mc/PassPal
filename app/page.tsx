import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { HomeAuthActions } from '@/components/home-auth-actions'

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-6xl p-4 pt-16 sm:p-6 lg:p-8">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Overview</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Welcome to your vault
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Your passwords and secure notes will appear here.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <HomeAuthActions />
          <Button asChild variant="outline">
            <Link href="/contacts">Open contacts</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Open password vault</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
