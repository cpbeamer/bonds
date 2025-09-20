import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-slate-900 hover:bg-slate-800',
            card: 'shadow-xl',
          },
        }}
      />
    </div>
  )
}