import { AccountNav } from '@/components/account-nav'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto w-full max-w-4xl p-4 pt-16 sm:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      <AccountNav />
      <div className="mt-6">{children}</div>
    </section>
  )
}
