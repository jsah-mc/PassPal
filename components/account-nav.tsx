'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Link2, ShieldCheck, UserRound } from 'lucide-react'

import { cn } from '@/lib/utils'

const links = [
  { href: '/account/profile', label: 'Profile', icon: UserRound },
  { href: '/account/connections', label: 'Connected accounts', icon: Link2 },
  {
    href: '/account/security',
    label: 'Security & sessions',
    icon: ShieldCheck,
  },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Account settings">
      {links.map((link) => (
        <Link
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium',
            pathname === link.href
              ? 'border-primary bg-primary text-primary-foreground'
              : 'bg-card hover:bg-accent',
          )}
          href={link.href}
          key={link.href}
        >
          <link.icon className="size-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
