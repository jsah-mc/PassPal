'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ContactRound,
  ChevronUp,
  Link2,
  Home,
  KeyRound,
  LockKeyhole,
  LogIn,
  LogOut,
  ShieldCheck,
  UserRound,
  UserPlus,
} from 'lucide-react'

import { UserAvatar } from '@/components/user-avatar'
import { useSupabase } from '@/integrations/supabase/provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Contacts',
    url: '/contacts',
    icon: ContactRound,
  },
  {
    title: 'Password vault',
    url: '/dashboard',
    icon: KeyRound,
  },
]

export function AppSidebar() {
  const { setOpenMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex h-12 items-center gap-3 px-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LockKeyhole className="size-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">PassPal</p>
            <p className="truncate text-xs text-muted-foreground">
              Your password manager
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    item.url === '/'
                      ? pathname === item.url
                      : pathname.startsWith(item.url)
                  }
                  tooltip={item.title}
                >
                  <Link href={item.url} onClick={() => setOpenMobile(false)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <AuthSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function AuthSidebarFooter() {
  const { setOpenMobile } = useSidebar()
  const { supabase, user, isLoading } = useSupabase()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const displayName = user?.user_metadata.full_name ?? user?.email ?? 'Account'
  const avatarUrl =
    user?.user_metadata.avatar_url ?? user?.user_metadata.picture ?? null

  async function signOut() {
    await supabase.auth.signOut()
    setOpenMobile(false)
  }

  return (
    <SidebarMenu>
      {isLoading ? (
        <SidebarMenuItem>
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        </SidebarMenuItem>
      ) : user ? (
        <>
          {isMenuOpen && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile">
                  <Link
                    href="/account/profile"
                    onClick={() => setOpenMobile(false)}
                  >
                    <UserRound />
                    <span>Profile & appearance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Connected accounts">
                  <Link
                    href="/account/connections"
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link2 />
                    <span>Connected accounts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Security">
                  <Link
                    href="/account/security"
                    onClick={() => setOpenMobile(false)}
                  >
                    <ShieldCheck />
                    <span>Security & sessions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut} tooltip="Sign out">
                  <LogOut />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-auto py-2"
              tooltip={displayName}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <UserAvatar
                avatarUrl={avatarUrl}
                className="size-8"
                name={displayName}
              />
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </span>
              <ChevronUp className={isMenuOpen ? '' : 'rotate-180'} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </>
      ) : (
        <>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign in">
              <Link href="/auth" onClick={() => setOpenMobile(false)}>
                <LogIn />
                <span>Sign in</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Create account">
              <Link
                href="/auth?mode=sign-up"
                onClick={() => setOpenMobile(false)}
              >
                <UserPlus />
                <span>Create account</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </>
      )}
    </SidebarMenu>
  )
}
