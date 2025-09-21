import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Shield, Clock, Calculator } from 'lucide-react'
import { theme, brand } from '@/lib/themes'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-800">
      <main className={`${theme.layout.container.margin} ${theme.layout.container.padding} py-20`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-neutral-50 mb-6">
            {brand.tagline}
          </h1>
          <p className="text-xl text-gray-600 dark:text-neutral-300 mb-8">
            {brand.description}
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20" id="features">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Calculator className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-neutral-100">After-Tax Yields</h3>
              <p className="text-gray-600 dark:text-neutral-300 text-sm">
                Automatic ATYTW calculations including OID/premium adjustments
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Shield className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-neutral-100">Stability Scoring</h3>
              <p className="text-gray-600 dark:text-neutral-300 text-sm">
                Issuer and sector analysis for solvency context
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-neutral-100">Smart Rankings</h3>
              <p className="text-gray-600 dark:text-neutral-300 text-sm">
                Top 5-10 opportunities from thousands of bonds
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Clock className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-neutral-100">Daily Delivery</h3>
              <p className="text-gray-600 dark:text-neutral-300 text-sm">
                Fresh opportunities at 8 AM ET or your schedule
              </p>
            </div>
          </div>

          <div className="mt-20 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 dark:text-neutral-100">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div>
                <div className="text-4xl font-bold text-orange-200 dark:text-orange-300 mb-2">01</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-neutral-100">Set Your Profile</h3>
                <p className="text-gray-600 dark:text-neutral-300">
                  Enter your tax situation, risk preferences, and search criteria
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-200 dark:text-orange-300 mb-2">02</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-neutral-100">We Scout Daily</h3>
                <p className="text-gray-600 dark:text-neutral-300">
                  Our engine analyzes thousands of bonds for after-tax value
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-200 dark:text-orange-300 mb-2">03</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-neutral-100">Get Top Picks</h3>
                <p className="text-gray-600 dark:text-neutral-300">
                  Receive ranked opportunities with clear explanations
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-6 dark:text-neutral-100">Simple Pricing</h2>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-4xl font-bold mb-2 dark:text-neutral-100">$50<span className="text-lg text-gray-600 dark:text-neutral-400">/month</span></div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="dark:text-neutral-200">Daily personalized bond rankings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="dark:text-neutral-200">After-tax yield calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="dark:text-neutral-200">Cross-state comparisons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="dark:text-neutral-200">Email & dashboard access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="dark:text-neutral-200">Cancel anytime</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full" size="lg">
                  Start 7-Day Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 dark:bg-neutral-900 text-white dark:text-neutral-200 py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2024 BondScout. Investment research tool, not advice.</p>
        </div>
      </footer>
    </div>
  )
}