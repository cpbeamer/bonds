import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Shield, Clock, Calculator } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Tax-Aware Bond Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Turn overwhelming bond searches into ranked, actionable opportunities.
            Personalized after-tax yields delivered to your inbox daily.
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
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Calculator className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">After-Tax Yields</h3>
              <p className="text-gray-600 text-sm">
                Automatic ATYTW calculations including OID/premium adjustments
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Shield className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Stability Scoring</h3>
              <p className="text-gray-600 text-sm">
                Issuer and sector analysis for solvency context
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Rankings</h3>
              <p className="text-gray-600 text-sm">
                Top 5-10 opportunities from thousands of bonds
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Clock className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Daily Delivery</h3>
              <p className="text-gray-600 text-sm">
                Fresh opportunities at 8 AM ET or your schedule
              </p>
            </div>
          </div>

          <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div>
                <div className="text-4xl font-bold text-orange-200 mb-2">01</div>
                <h3 className="text-xl font-semibold mb-2">Set Your Profile</h3>
                <p className="text-gray-600">
                  Enter your tax situation, risk preferences, and search criteria
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-200 mb-2">02</div>
                <h3 className="text-xl font-semibold mb-2">We Scout Daily</h3>
                <p className="text-gray-600">
                  Our engine analyzes thousands of bonds for after-tax value
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-200 mb-2">03</div>
                <h3 className="text-xl font-semibold mb-2">Get Top Picks</h3>
                <p className="text-gray-600">
                  Receive ranked opportunities with clear explanations
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-6">Simple Pricing</h2>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-4xl font-bold mb-2">$50<span className="text-lg text-gray-600">/month</span></div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Daily personalized bond rankings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  After-tax yield calculations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Cross-state comparisons
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Email & dashboard access
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Cancel anytime
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

      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2024 BondScout. Investment research tool, not advice.</p>
        </div>
      </footer>
    </div>
  )
}