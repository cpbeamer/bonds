import { SignUp } from '@clerk/nextjs'
import { theme } from '@/lib/themes'

export default function SignUpPage() {
  return (
    <div className={`${theme.layout.page.background} flex items-center justify-center`}>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
            card: 'shadow-xl bg-white dark:bg-neutral-800 border dark:border-neutral-700',
            headerTitle: 'dark:text-neutral-100',
            headerSubtitle: 'dark:text-neutral-300',
            socialButtonsBlockButton: 'dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-600',
            formFieldLabel: 'dark:text-neutral-200',
            formFieldInput: 'dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100',
            footerActionText: 'dark:text-neutral-300',
            footerActionLink: 'text-orange-600 hover:text-orange-700',
          },
        }}
      />
    </div>
  )
}