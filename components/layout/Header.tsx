'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { theme, getButtonClasses, brand } from '@/lib/themes'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Header() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'
  const isAIResearch = pathname === '/ai-research'
  const isSignedInPage = isDashboard || isAIResearch

  return (
    <header className={`${theme.layout.header.background} ${theme.layout.header.padding} flex justify-between items-center gap-4`} style={{ height: theme.layout.header.height }}>
      <div className="flex items-center gap-4">
        <div className="font-semibold text-xl dark:text-neutral-100">{brand.name}</div>
      </div>

      {/* Centered Navigation */}
      {isSignedInPage && (
        <SignedIn>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-md transition-colors ${
                isDashboard
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/ai-research"
              className={`px-4 py-2 rounded-md transition-colors ${
                isAIResearch
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              AI Research
            </Link>
          </div>
        </SignedIn>
      )}

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