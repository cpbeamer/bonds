'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Star,
  Calculator,
  ExternalLink,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { theme } from '@/lib/themes'

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

interface YieldData {
  category: string
  isHeader?: boolean
  threeMonth: string
  sixMonth: string
  nineMonth: string
  oneYear: string
  twoYear: string
  threeYear: string
  fiveYear: string
  tenYear: string
  twentyYear: string
  thirtyYear?: string
}

interface LadderData {
  term: string
  rate: number
  months: number
}

export default function DashboardPage() {
  const { user } = useUser()
  const [results, setResults] = useState<BondResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYieldView, setSelectedYieldView] = useState<'highest' | 'median'>('highest')
  const [selectedLadder, setSelectedLadder] = useState<'1year' | '2year' | '5year'>('1year')

  const ladderConfigs = {
    '1year': {
      title: '1-Year Ladder',
      subtitle: '(4 CDs)',
      apy: '3.90',
      data: [
        { term: '3 mo', rate: 4.05, months: 3 },
        { term: '6 mo', rate: 3.95, months: 6 },
        { term: '9 mo', rate: 3.85, months: 9 },
        { term: '12 mo', rate: 3.75, months: 12 }
      ]
    },
    '2year': {
      title: '2-Year Ladder',
      subtitle: '(4 CDs)',
      apy: '3.73',
      data: [
        { term: '6 mo', rate: 3.95, months: 6 },
        { term: '12 mo', rate: 3.75, months: 12 },
        { term: '18 mo', rate: 3.65, months: 18 },
        { term: '24 mo', rate: 3.55, months: 24 }
      ]
    },
    '5year': {
      title: '5-Year Ladder',
      subtitle: '(5 CDs)',
      apy: '3.64',
      data: [
        { term: '1 yr', rate: 3.75, months: 12 },
        { term: '2 yr', rate: 3.55, months: 24 },
        { term: '3 yr', rate: 3.55, months: 36 },
        { term: '4 yr', rate: 3.60, months: 48 },
        { term: '5 yr', rate: 3.75, months: 60 }
      ]
    }
  }

  const yieldData: YieldData[] = [
    {
      category: 'CDs (New Issues)',
      threeMonth: '4.05%',
      sixMonth: '3.95%',
      nineMonth: '3.85%',
      oneYear: '3.90%',
      twoYear: '3.80%',
      threeYear: '3.85%',
      fiveYear: '3.95%',
      tenYear: '4.25%',
      twentyYear: '--',
      thirtyYear: '--'
    },
    {
      category: 'BONDS',
      isHeader: true,
      threeMonth: '',
      sixMonth: '',
      nineMonth: '',
      oneYear: '',
      twoYear: '',
      threeYear: '',
      fiveYear: '',
      tenYear: '',
      twentyYear: ''
    },
    {
      category: 'U.S. Treasury',
      threeMonth: '3.93%',
      sixMonth: '3.83%',
      nineMonth: '3.8%',
      oneYear: '3.72%',
      twoYear: '3.61%',
      threeYear: '3.59%',
      fiveYear: '3.71%',
      tenYear: '4.14%',
      twentyYear: '4.79%',
      thirtyYear: '4.76%'
    },
    {
      category: 'U.S. Treasury $TRIPS®',
      threeMonth: '--',
      sixMonth: '--',
      nineMonth: '--',
      oneYear: '3.53%',
      twoYear: '3.59%',
      threeYear: '3.61%',
      fiveYear: '3.78%',
      tenYear: '4.35%',
      twentyYear: '5.01%',
      thirtyYear: '4.84%'
    },
    {
      category: 'Agency/GSE',
      threeMonth: '3.98%',
      sixMonth: '3.92%',
      nineMonth: '3.79%',
      oneYear: '3.81%',
      twoYear: '3.75%',
      threeYear: '4.44%',
      fiveYear: '4.37%',
      tenYear: '5.13%',
      twentyYear: '5.59%',
      thirtyYear: '5.28%'
    },
    {
      category: 'Corporate (Aaa/AAA)',
      threeMonth: '--',
      sixMonth: '3.91%',
      nineMonth: '3.54%',
      oneYear: '3.72%',
      twoYear: '3.59%',
      threeYear: '3.65%',
      fiveYear: '3.87%',
      tenYear: '4.45%',
      twentyYear: '4.96%',
      thirtyYear: '5.16%'
    },
    {
      category: 'Corporate (Aa/AA)',
      threeMonth: '3.94%',
      sixMonth: '4.01%',
      nineMonth: '3.85%',
      oneYear: '3.93%',
      twoYear: '3.82%',
      threeYear: '3.85%',
      fiveYear: '4.11%',
      tenYear: '4.68%',
      twentyYear: '5.24%',
      thirtyYear: '5.55%'
    },
    {
      category: 'Corporate (A/A)',
      threeMonth: '4.25%',
      sixMonth: '4.08%',
      nineMonth: '4.08%',
      oneYear: '4.10%',
      twoYear: '4.51%',
      threeYear: '4.15%',
      fiveYear: '4.46%',
      tenYear: '5.98%',
      twentyYear: '5.98%',
      thirtyYear: '5.99%'
    },
    {
      category: 'Corporate (Baa/BBB)',
      threeMonth: '4.52%',
      sixMonth: '4.48%',
      nineMonth: '4.52%',
      oneYear: '4.47%',
      twoYear: '4.96%',
      threeYear: '5.70%',
      fiveYear: '5.78%',
      tenYear: '6.34%',
      twentyYear: '6.28%',
      thirtyYear: '6.94%'
    },
    {
      category: 'Municipal (Aaa/AAA)',
      threeMonth: '2.88%',
      sixMonth: '2.79%',
      nineMonth: '3.25%',
      oneYear: '2.74%',
      twoYear: '3.02%',
      threeYear: '3.07%',
      fiveYear: '3.47%',
      tenYear: '3.96%',
      twentyYear: '4.61%',
      thirtyYear: '4.45%'
    },
    {
      category: 'Municipal (Aa/AA)',
      threeMonth: '3.13%',
      sixMonth: '3.75%',
      nineMonth: '3.78%',
      oneYear: '3.17%',
      twoYear: '3.13%',
      threeYear: '3.97%',
      fiveYear: '3.31%',
      tenYear: '4.25%',
      twentyYear: '4.78%',
      thirtyYear: '4.91%'
    },
    {
      category: 'Municipal (A/A)',
      threeMonth: '3.36%',
      sixMonth: '3.01%',
      nineMonth: '3.02%',
      oneYear: '3.08%',
      twoYear: '3.14%',
      threeYear: '3.27%',
      fiveYear: '3.4%',
      tenYear: '4.34%',
      twentyYear: '5.27%',
      thirtyYear: '5.02%'
    },
    {
      category: 'Taxable Municipal**',
      threeMonth: '4.20%',
      sixMonth: '0.71%',
      nineMonth: '4.29%',
      oneYear: '4.19%',
      twoYear: '4.06%',
      threeYear: '4.18%',
      fiveYear: '4.38%',
      tenYear: '5.07%',
      twentyYear: '5.37%',
      thirtyYear: '6.11%'
    }
  ]

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


  const LadderChart = ({ data, maxRate = 4.5 }: { data: LadderData[], maxRate?: number }) => {
    return (
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => {
          const height = (item.rate / maxRate) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              <span className="text-xs font-medium mb-1">{item.rate.toFixed(2)}</span>
              <div
                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 dark:from-orange-600 dark:to-orange-500 rounded-t"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-muted-foreground mt-1">{item.term}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-transparent dark:to-transparent dark:bg-background">
      <main className={`${theme.layout.container.margin} ${theme.layout.container.padding} ${theme.layout.page.padding}`}>
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
                      {results.map((result, index) => (
                        <TableRow key={`${result.id}-${index}`}>
                          <TableCell>
                            <Badge variant="default">{result.rank}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{result.bond.issuerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {result.bond.state} • {result.bond.sector}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{result.bond.coupon}% • {new Date(result.bond.maturity).getFullYear()}</div>
                              <div className="text-muted-foreground">
                                {result.bond.ratingBucket} {result.bond.callable && '• Callable'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {(result.atytw * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
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

<Card className="mt-8">
          <CardHeader>
            <CardTitle>Fixed Income & CD Ladders</CardTitle>
            <CardDescription>
              Explore current yields and build CD ladder strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="yields" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="yields">Bond Yields</TabsTrigger>
                <TabsTrigger value="ladders">CD Ladders</TabsTrigger>
              </TabsList>

              <TabsContent value="yields" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant={selectedYieldView === 'highest' ? 'default' : 'outline'}
                      onClick={() => setSelectedYieldView('highest')}
                    >
                      Highest Yield
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedYieldView === 'median' ? 'default' : 'outline'}
                      onClick={() => setSelectedYieldView('median')}
                    >
                      Median Yield
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background min-w-[200px]">Type</TableHead>
                        <TableHead className="text-center min-w-[80px]">3mo</TableHead>
                        <TableHead className="text-center min-w-[80px]">6mo</TableHead>
                        <TableHead className="text-center min-w-[80px]">9mo</TableHead>
                        <TableHead className="text-center min-w-[80px]">1yr</TableHead>
                        <TableHead className="text-center min-w-[80px]">2yr</TableHead>
                        <TableHead className="text-center min-w-[80px]">3yr</TableHead>
                        <TableHead className="text-center min-w-[80px]">5yr</TableHead>
                        <TableHead className="text-center min-w-[80px]">10yr</TableHead>
                        <TableHead className="text-center min-w-[80px]">20yr</TableHead>
                        <TableHead className="text-center min-w-[80px]">30yr+</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yieldData.map((row, index) => (
                        <TableRow key={index} className={row.isHeader ? 'bg-muted/50' : ''}>
                          <TableCell className={`sticky left-0 bg-background font-medium ${row.isHeader ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''}`}>
                            {row.category}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.threeMonth !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.threeMonth}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.sixMonth !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.sixMonth}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.nineMonth !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.nineMonth}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.oneYear !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.oneYear}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.twoYear !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.twoYear}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.threeYear !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.threeYear}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.fiveYear !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.fiveYear}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.tenYear !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.tenYear}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.twentyYear !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.twentyYear}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.thirtyYear !== '--' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {row.thirtyYear || '--'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>AS OF {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} ET {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}. YIELDS MAY BE DELAYED UP TO 15 MINUTES.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ladders" className="mt-6">
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Model CD Ladders provide an easy way to invest in multiple Certificates of Deposit (CDs) at a time, blending longer-term CDs with shorter-term CDs.
                  </p>
                  <Tabs value={selectedLadder} onValueChange={(v) => setSelectedLadder(v as '1year' | '2year' | '5year')}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="1year">1-Year Ladder</TabsTrigger>
                      <TabsTrigger value="2year">2-Year Ladder</TabsTrigger>
                      <TabsTrigger value="5year">5-Year Ladder</TabsTrigger>
                    </TabsList>
                    {Object.entries(ladderConfigs).map(([key, config]) => (
                      <TabsContent key={key} value={key} className="mt-6">
                        <div className="space-y-4">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold">{config.title}</h3>
                            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-6">
                            <LadderChart data={config.data} />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Ladder APY:</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{config.apy}%</p>
                          </div>
                          <div className="flex justify-center">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                              Build {config.title}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  <div className="mt-8 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-4">New Issue CDs by Top Rates</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">All CDs</TableHead>
                            <TableHead className="text-center">3mo</TableHead>
                            <TableHead className="text-center">6mo</TableHead>
                            <TableHead className="text-center">9mo</TableHead>
                            <TableHead className="text-center">1yr</TableHead>
                            <TableHead className="text-center">18mo</TableHead>
                            <TableHead className="text-center">2yr</TableHead>
                            <TableHead className="text-center">3yr</TableHead>
                            <TableHead className="text-center">4yr</TableHead>
                            <TableHead className="text-center">5yr</TableHead>
                            <TableHead className="text-center">10yr</TableHead>
                            <TableHead className="text-center">20yr</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">CDs</TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">4.05</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">3.95</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">3.85</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">3.90</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">3.80</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">3.80</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">3.85</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">3.80</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">3.95</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">4.25</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-muted-foreground">--</span>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="text-xs text-muted-foreground text-right">
                      RATES AS OF {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} ET {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}