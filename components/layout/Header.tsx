'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { theme, getButtonClasses, brand } from '@/lib/themes'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  return (
    <header className={`${theme.layout.header.background} ${theme.layout.header.padding} flex justify-between items-center gap-4`} style={{ height: theme.layout.header.height }}>
      <div className="flex items-center gap-4">
        <div className="font-semibold text-xl dark:text-neutral-100">{brand.name}</div>
        {isDashboard && <Badge variant="outline">Dashboard</Badge>}
      </div>
      <div className="flex items-center gap-4">
        <SignedOut>
          <ThemeToggle />
          <SignInButton mode="modal">
            <button className={getButtonClasses('ghost')}>
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className={getButtonClasses('primary')}>
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <ThemeToggle />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8",
              }
            }}
          />
        </SignedIn>
      </div>
    </header>
  )
}