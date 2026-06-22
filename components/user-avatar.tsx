import { UserRound } from 'lucide-react'

import { cn } from '@/lib/utils'

export function UserAvatar({
  avatarUrl,
  name,
  className,
}: {
  avatarUrl?: string | null
  name?: string | null
  className?: string
}) {
  const initial = name?.trim().charAt(0).toUpperCase()

  return (
    <span
      aria-label={name ? `${name}'s profile picture` : 'Profile picture'}
      className={cn(
        'relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 font-semibold text-primary',
        className,
      )}
      role="img"
    >
      {avatarUrl ? (
        <span
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${avatarUrl.replaceAll('"', '\\"')}")`,
          }}
        />
      ) : initial ? (
        initial
      ) : (
        <UserRound className="size-4" />
      )}
    </span>
  )
}
