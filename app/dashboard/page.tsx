'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  TrendingUp,
  Search,
  Star,
  Calculator,
  Settings,
  Mail,
  ExternalLink,
  Filter,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

interface BondResult {
  id: string
  bond: {
    cusip: string
    issuerName: string
    state: string
    type: string
    sector: string
    ratingBucket: string
    coupon: number
    maturity: string
    callable: boolean
    price?: number
  }
  rank: number
  atytw: number
  preTaxYtw: number
  stabilityScore: number
  liquidityScore: number
  explanation: any
}

export default function DashboardPage() {
  const { user } = useUser()
  const [results, setResults] = useState<BondResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLatestResults()
  }, [])

  const fetchLatestResults = async () => {
    try {
      const response = await fetch('/api/bonds/results')
      if (!response.ok) throw new Error('Failed to fetch results')
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Error fetching results:', error)
      setResults(getMockResults())
    } finally {
      setLoading(false)
    }
  }

  const getMockResults = (): BondResult[] => [
    {
      id: '1',
      bond: {
        cusip: 'XXXX1234',
        issuerName: 'Fairfax County VA',
        state: 'VA',
        type: 'MUNICIPAL',
        sector: 'general-obligation',
        ratingBucket: 'AAA',
        coupon: 4.25,
        maturity: '2034-08-01',
        callable: false,
        price: 98.5,
      },
      rank: 1,
      atytw: 3.12,
      preTaxYtw: 4.35,
      stabilityScore: 0.95,
      liquidityScore: 0.88,
      explanation: { notes: ['GO county', 'AAA rated', 'In-state exempt'] }
    },
    {
      id: '2',
      bond: {
        cusip: 'YYYY5678',
        issuerName: 'Alexandria VA Water',
        state: 'VA',
        type: 'MUNICIPAL',
        sector: 'water-sewer',
        ratingBucket: 'AA+',
        coupon: 4.50,
        maturity: '2033-12-01',
        callable: true,
        price: 101.2,
      },
      rank: 2,
      atytw: 3.08,
      preTaxYtw: 4.28,
      stabilityScore: 0.92,
      liquidityScore: 0.75,
      explanation: { notes: ['Essential service', 'Strong utility', 'Premium bond'] }
    },
    {
      id: '3',
      bond: {
        cusip: 'ZZZZ9012',
        issuerName: 'Virginia Public School',
        state: 'VA',
        type: 'MUNICIPAL',
        sector: 'school-district',
        ratingBucket: 'AA',
        coupon: 4.00,
        maturity: '2035-06-01',
        callable: false,
        price: 96.8,
      },
      rank: 3,
      atytw: 3.05,
      preTaxYtw: 4.25,
      stabilityScore: 0.85,
      liquidityScore: 0.82,
      explanation: { notes: ['School district', 'State backing', 'Discount bond'] }
    },
  ]

  const addToWatchlist = async (bondId: string) => {
    toast.success('Added to watchlist')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">BondScout</h1>
              <Badge variant="outline">Dashboard</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Mail className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="text-sm text-slate-600">
                {user?.firstName} {user?.lastName}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Top Pick</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.12%</div>
              <p className="text-xs text-slate-600">After-tax YTW</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Bonds Analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-slate-600">Last 24 hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Watchlist Items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-slate-600">3 with alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Next Delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8:00 AM</div>
              <p className="text-xs text-slate-600">Tomorrow</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="results" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="results">
                <TrendingUp className="w-4 h-4 mr-2" />
                Today's Results
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="w-4 h-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger value="watchlist">
                <Star className="w-4 h-4 mr-2" />
                Watchlist
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Input
                placeholder="Filter bonds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Ranked Bonds</CardTitle>
                <CardDescription>
                  Based on your tax profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Issuer</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">ATYTW</TableHead>
                        <TableHead className="text-right">Pre-Tax</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Scores</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <Badge variant="default">{result.rank}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{result.bond.issuerName}</div>
                              <div className="text-sm text-slate-600">
                                {result.bond.state} • {result.bond.sector}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{result.bond.coupon}% • {new Date(result.bond.maturity).getFullYear()}</div>
                              <div className="text-slate-600">
                                {result.bond.ratingBucket} {result.bond.callable && '• Callable'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {(result.atytw * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            {(result.preTaxYtw * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right">
                            {result.bond.price?.toFixed(2) || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                S: {(result.stabilityScore * 100).toFixed(0)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                L: {(result.liquidityScore * 100).toFixed(0)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addToWatchlist(result.id)}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Calculator className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">10Y Treasury</p>
                    <p className="text-lg font-semibold">4.25%</p>
                    <p className="text-sm text-green-600">-2 bps</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Muni/Treasury Ratio</p>
                    <p className="text-lg font-semibold">68.5%</p>
                    <p className="text-sm text-slate-600">+0.5%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">VA GO Index</p>
                    <p className="text-lg font-semibold">3.95%</p>
                    <p className="text-sm text-green-600">-1 bp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>
                  Search and filter bonds with custom criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-600">
                  Advanced search interface coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist">
            <Card>
              <CardHeader>
                <CardTitle>Your Watchlist</CardTitle>
                <CardDescription>
                  Track your favorite bonds and set alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-600">
                  Your watchlist is empty. Add bonds from the results page.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}