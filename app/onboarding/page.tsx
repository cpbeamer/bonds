'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, ArrowLeft, Calculator, Shield, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { theme, brand } from '@/lib/themes'

const US_STATES = [
  { value: 'VA', label: 'Virginia' },
  { value: 'MD', label: 'Maryland' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'NY', label: 'New York' },
  { value: 'CA', label: 'California' },
  { value: 'TX', label: 'Texas' },
  { value: 'FL', label: 'Florida' },
  { value: 'IL', label: 'Illinois' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'OH', label: 'Ohio' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'GA', label: 'Georgia' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'WA', label: 'Washington' },
  { value: 'CO', label: 'Colorado' },
  { value: 'AZ', label: 'Arizona' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState('tax')
  const [loading, setLoading] = useState(false)

  const [taxProfile, setTaxProfile] = useState({
    state: '',
    filingStatus: '',
    federalRate: '',
    stateRate: '',
    localRate: '',
    amtApplies: false,
  })

  const [preferences, setPreferences] = useState({
    riskMode: 'MODERATE',
    ratingFloor: 'A',
    priceFloor: '95',
    ytwFloor: '4.0',
    maxMaturity: '30',
    allowCallable: true,
    minLotSize: '5000',
  })

  const [subscription, setSubscription] = useState({
    cadence: 'DAILY',
    deliveryTime: '08:00',
  })

  const handleTaxSubmit = () => {
    if (!taxProfile.state || !taxProfile.filingStatus || !taxProfile.federalRate || !taxProfile.stateRate) {
      toast.error('Please fill in all required tax information')
      return
    }
    setCurrentStep('preferences')
  }

  const handlePreferencesSubmit = () => {
    setCurrentStep('subscription')
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxProfile,
          preferences,
          subscription,
        }),
      })

      if (!response.ok) throw new Error('Failed to save profile')

      toast.success('Profile created successfully!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to save profile. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${theme.layout.page.background} p-4`}>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 dark:text-neutral-100">Welcome to {brand.name}</h1>
          <p className="text-slate-600 dark:text-neutral-300">Let's set up your personalized bond scouting profile</p>
        </div>

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tax">
              <Calculator className="w-4 h-4 mr-2" />
              Tax Profile
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Shield className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <DollarSign className="w-4 h-4 mr-2" />
              Delivery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tax" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
                <CardDescription>
                  We'll use this to calculate your after-tax yields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State of Residence *</Label>
                    <Select value={taxProfile.state} onValueChange={(value) => setTaxProfile({...taxProfile, state: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filing">Filing Status *</Label>
                    <Select value={taxProfile.filingStatus} onValueChange={(value) => setTaxProfile({...taxProfile, filingStatus: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select filing status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="MARRIED_JOINT">Married Filing Jointly</SelectItem>
                        <SelectItem value="MARRIED_SEPARATE">Married Filing Separately</SelectItem>
                        <SelectItem value="HEAD_OF_HOUSEHOLD">Head of Household</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="federal">Federal Tax Rate (%) *</Label>
                    <Input
                      id="federal"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 24"
                      value={taxProfile.federalRate}
                      onChange={(e) => setTaxProfile({...taxProfile, federalRate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state-rate">State Tax Rate (%) *</Label>
                    <Input
                      id="state-rate"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5.75"
                      value={taxProfile.stateRate}
                      onChange={(e) => setTaxProfile({...taxProfile, stateRate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local">Local Tax Rate (%)</Label>
                    <Input
                      id="local"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 1.5"
                      value={taxProfile.localRate}
                      onChange={(e) => setTaxProfile({...taxProfile, localRate: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="amt"
                      checked={taxProfile.amtApplies}
                      onChange={(e) => setTaxProfile({...taxProfile, amtApplies: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-orange-600 focus:ring-orange-500 dark:bg-neutral-800"
                    />
                    <Label htmlFor="amt" className="dark:text-neutral-200">Subject to AMT</Label>
                  </div>
                </div>

                <Button onClick={handleTaxSubmit} className="w-full">
                  Continue to Preferences <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Preferences</CardTitle>
                <CardDescription>
                  Set your risk tolerance and search criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Risk Mode</Label>
                  <Select value={preferences.riskMode} onValueChange={(value) => setPreferences({...preferences, riskMode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSERVATIVE">Conservative (AA+ or better)</SelectItem>
                      <SelectItem value="MODERATE">Moderate (A or better)</SelectItem>
                      <SelectItem value="AGGRESSIVE">Aggressive (BBB or better)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price-floor">Minimum Price</Label>
                    <Input
                      id="price-floor"
                      type="number"
                      step="1"
                      value={preferences.priceFloor}
                      onChange={(e) => setPreferences({...preferences, priceFloor: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ytw-floor">Minimum YTW (%)</Label>
                    <Input
                      id="ytw-floor"
                      type="number"
                      step="0.1"
                      value={preferences.ytwFloor}
                      onChange={(e) => setPreferences({...preferences, ytwFloor: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maturity">Max Maturity (years)</Label>
                    <Input
                      id="maturity"
                      type="number"
                      value={preferences.maxMaturity}
                      onChange={(e) => setPreferences({...preferences, maxMaturity: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lot">Min Lot Size ($)</Label>
                    <Input
                      id="lot"
                      type="number"
                      step="1000"
                      value={preferences.minLotSize}
                      onChange={(e) => setPreferences({...preferences, minLotSize: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="callable"
                    checked={preferences.allowCallable}
                    onChange={(e) => setPreferences({...preferences, allowCallable: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-orange-600 focus:ring-orange-500 dark:bg-neutral-800"
                  />
                  <Label htmlFor="callable" className="dark:text-neutral-200">Include callable bonds</Label>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setCurrentStep('tax')} variant="outline" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tax Profile
                  </Button>
                  <Button onClick={handlePreferencesSubmit} className="flex-1">
                    Continue to Delivery <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>
                  Choose how often you want to receive bond recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Delivery Frequency</Label>
                  <Select value={subscription.cadence} onValueChange={(value) => setSubscription({...subscription, cadence: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="TWICE_WEEKLY">Twice Weekly (Tue/Fri)</SelectItem>
                      <SelectItem value="WEEKLY">Weekly (Friday)</SelectItem>
                      <SelectItem value="MONTHLY">Monthly (1st of month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Delivery Time (ET)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={subscription.deliveryTime}
                    onChange={(e) => setSubscription({...subscription, deliveryTime: e.target.value})}
                  />
                </div>

                <Card className="bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold mb-2 dark:text-neutral-100">$50/month</p>
                      <p className="text-sm text-slate-600 dark:text-neutral-400">7-day free trial • Cancel anytime</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button onClick={() => setCurrentStep('preferences')} variant="outline" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Preferences
                  </Button>
                  <Button onClick={handleComplete} className="flex-1" disabled={loading}>
                    {loading ? 'Setting up...' : 'Complete Setup & Start Trial'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}