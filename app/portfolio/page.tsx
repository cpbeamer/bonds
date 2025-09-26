'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  PieChart,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  Shield,
  Activity,
  Briefcase,
  Target,
  Info
} from 'lucide-react'
import { theme } from '@/lib/themes'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  RadialLinearScale,
} from 'chart.js'
import { Doughnut, Line, Bar, Radar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  RadialLinearScale
)

interface PortfolioHolding {
  id: string
  bondId: string
  bond: {
    cusip: string
    issuerName: string
    type: string
    state?: string
    sector?: string
    coupon: number
    maturity: string
    ratingBucket: string
    callable: boolean
  }
  quantity: number
  purchasePrice: number
  purchaseDate: string
  currentPrice: number
  currentYield: number
  atytw: number
}

interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalReturn: number
  totalReturnPercent: number
  averageYield: number
  averageAtytw: number
  averageDuration: number
  averageRating: string
  monthlyIncome: number
  annualIncome: number
}

interface RiskMetrics {
  concentrationRisk: number
  durationRisk: number
  creditRisk: number
  liquidityRisk: number
  overall: number
}

export default function PortfolioPage() {
  const { user } = useUser()
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      // For demo purposes, using mock data
      const mockHoldings: PortfolioHolding[] = [
        {
          id: '1',
          bondId: '1',
          bond: {
            cusip: 'XXXX1234',
            issuerName: 'Fairfax County VA',
            type: 'MUNICIPAL',
            state: 'VA',
            sector: 'general-obligation',
            coupon: 4.25,
            maturity: '2034-08-01',
            ratingBucket: 'AAA',
            callable: false,
          },
          quantity: 25000,
          purchasePrice: 98.5,
          purchaseDate: '2024-01-15',
          currentPrice: 101.2,
          currentYield: 4.2,
          atytw: 3.12,
        },
        {
          id: '2',
          bondId: '2',
          bond: {
            cusip: 'YYYY5678',
            issuerName: 'California State',
            type: 'MUNICIPAL',
            state: 'CA',
            sector: 'general-obligation',
            coupon: 5.0,
            maturity: '2033-12-01',
            ratingBucket: 'AA',
            callable: true,
          },
          quantity: 50000,
          purchasePrice: 102.5,
          purchaseDate: '2024-02-20',
          currentPrice: 103.8,
          currentYield: 4.8,
          atytw: 3.56,
        },
        {
          id: '3',
          bondId: '3',
          bond: {
            cusip: 'ZZZZ9012',
            issuerName: 'New York City Water',
            type: 'MUNICIPAL',
            state: 'NY',
            sector: 'water-sewer',
            coupon: 3.75,
            maturity: '2035-06-01',
            ratingBucket: 'AA+',
            callable: false,
          },
          quantity: 30000,
          purchasePrice: 96.8,
          purchaseDate: '2024-03-10',
          currentPrice: 98.5,
          currentYield: 3.81,
          atytw: 2.82,
        },
        {
          id: '4',
          bondId: '4',
          bond: {
            cusip: 'AAAA3456',
            issuerName: 'US Treasury',
            type: 'TREASURY',
            sector: 'treasury',
            coupon: 4.5,
            maturity: '2034-05-15',
            ratingBucket: 'AAA',
            callable: false,
          },
          quantity: 40000,
          purchasePrice: 99.2,
          purchaseDate: '2024-01-20',
          currentPrice: 100.5,
          currentYield: 4.47,
          atytw: 4.47,
        },
        {
          id: '5',
          bondId: '5',
          bond: {
            cusip: 'BBBB7890',
            issuerName: 'Texas Toll Road',
            type: 'MUNICIPAL',
            state: 'TX',
            sector: 'transportation',
            coupon: 4.0,
            maturity: '2032-09-01',
            ratingBucket: 'A+',
            callable: true,
          },
          quantity: 35000,
          purchasePrice: 97.5,
          purchaseDate: '2024-02-05',
          currentPrice: 99.0,
          currentYield: 4.04,
          atytw: 3.0,
        },
      ]

      setHoldings(mockHoldings)

      // Calculate metrics
      const totalCost = mockHoldings.reduce((sum, h) => sum + (h.quantity * h.purchasePrice / 100), 0)
      const totalValue = mockHoldings.reduce((sum, h) => sum + (h.quantity * h.currentPrice / 100), 0)
      const totalReturn = totalValue - totalCost
      const totalReturnPercent = (totalReturn / totalCost) * 100

      const weightedYield = mockHoldings.reduce((sum, h) => {
        const value = h.quantity * h.currentPrice / 100
        return sum + (h.currentYield * value / totalValue)
      }, 0)

      const weightedAtytw = mockHoldings.reduce((sum, h) => {
        const value = h.quantity * h.currentPrice / 100
        return sum + (h.atytw * value / totalValue)
      }, 0)

      const annualIncome = mockHoldings.reduce((sum, h) => 
        sum + (h.quantity * h.bond.coupon / 100), 0
      )

      setMetrics({
        totalValue,
        totalCost,
        totalReturn,
        totalReturnPercent,
        averageYield: weightedYield,
        averageAtytw: weightedAtytw,
        averageDuration: 7.5, // Mock
        averageRating: 'AA+',
        monthlyIncome: annualIncome / 12,
        annualIncome,
      })

      // Calculate risk metrics (simplified)
      setRiskMetrics({
        concentrationRisk: 25, // Low concentration risk
        durationRisk: 65, // Moderate duration risk
        creditRisk: 15, // Low credit risk
        liquidityRisk: 30, // Low liquidity risk
        overall: 35, // Overall low-moderate risk
      })

    } catch (error) {
      console.error('Error fetching portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Chart data for allocation by type
  const typeAllocationData = {
    labels: ['Municipal', 'Treasury', 'Corporate'],
    datasets: [{
      data: [
        holdings.filter(h => h.bond.type === 'MUNICIPAL').length,
        holdings.filter(h => h.bond.type === 'TREASURY').length,
        holdings.filter(h => h.bond.type === 'CORPORATE').length,
      ],
      backgroundColor: [
        'rgba(251, 146, 60, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderColor: [
        'rgba(251, 146, 60, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
      ],
      borderWidth: 1,
    }],
  }

  // Chart data for sector allocation
  const sectorAllocationData = {
    labels: Array.from(new Set(holdings.map(h => h.bond.sector || 'Other'))),
    datasets: [{
      data: Array.from(new Set(holdings.map(h => h.bond.sector || 'Other'))).map(sector =>
        holdings.filter(h => (h.bond.sector || 'Other') === sector).reduce((sum, h) => 
          sum + (h.quantity * h.currentPrice / 100), 0
        )
      ),
      backgroundColor: [
        'rgba(251, 146, 60, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
    }],
  }

  // Chart data for maturity distribution
  const maturityData = {
    labels: ['0-2Y', '2-5Y', '5-10Y', '10-20Y', '20Y+'],
    datasets: [{
      label: 'Value ($)',
      data: [0, 0, 180000, 0, 0], // Simplified mock data
      backgroundColor: 'rgba(251, 146, 60, 0.5)',
      borderColor: 'rgba(251, 146, 60, 1)',
      borderWidth: 1,
    }],
  }

  // Chart data for risk profile
  const riskData = {
    labels: ['Concentration', 'Duration', 'Credit', 'Liquidity', 'Overall'],
    datasets: [{
      label: 'Risk Score',
      data: riskMetrics ? [
        riskMetrics.concentrationRisk,
        riskMetrics.durationRisk,
        riskMetrics.creditRisk,
        riskMetrics.liquidityRisk,
        riskMetrics.overall,
      ] : [],
      backgroundColor: 'rgba(251, 146, 60, 0.2)',
      borderColor: 'rgba(251, 146, 60, 1)',
      pointBackgroundColor: 'rgba(251, 146, 60, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(251, 146, 60, 1)',
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: false
        },
        suggestedMin: 0,
        suggestedMax: 100,
      }
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-transparent dark:to-transparent dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900 dark:text-neutral-50">Loading portfolio...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-transparent dark:to-transparent dark:bg-background">
      <main className={`${theme.layout.container.margin} ${theme.layout.container.padding} ${theme.layout.page.padding}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50">
            Portfolio Analytics
          </h1>
          <p className="text-gray-600 dark:text-neutral-300 mt-1">
            Comprehensive analysis of your bond portfolio
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    ${metrics?.totalValue.toLocaleString()}
                  </p>
                  {metrics && (
                    <p className={`text-sm ${metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.totalReturn >= 0 ? '+' : ''}{metrics.totalReturnPercent.toFixed(2)}%
                    </p>
                  )}
                </div>
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Yield</p>
                  <p className="text-2xl font-bold">
                    {metrics?.averageYield.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ATYTW: {metrics?.averageAtytw.toFixed(2)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Income</p>
                  <p className="text-2xl font-bold">
                    ${metrics?.annualIncome.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${metrics?.monthlyIncome.toLocaleString()}/mo
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-2xl font-bold">
                    {riskMetrics?.overall}%
                  </p>
                  <Badge variant={riskMetrics && riskMetrics.overall < 40 ? 'default' : 'secondary'}>
                    {riskMetrics && riskMetrics.overall < 40 ? 'Low Risk' : 'Moderate Risk'}
                  </Badge>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="allocation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="allocation" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Type Allocation</CardTitle>
                  <CardDescription>Distribution by bond type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={typeAllocationData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sector Allocation</CardTitle>
                  <CardDescription>Distribution by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={sectorAllocationData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maturity Distribution</CardTitle>
                  <CardDescription>Holdings by maturity buckets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar data={maturityData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Municipal bonds by state</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(holdings.filter(h => h.bond.state).map(h => h.bond.state))).map(state => {
                      const stateHoldings = holdings.filter(h => h.bond.state === state)
                      const stateValue = stateHoldings.reduce((sum, h) => sum + (h.quantity * h.currentPrice / 100), 0)
                      const percent = (stateValue / (metrics?.totalValue || 1)) * 100
                      
                      return (
                        <div key={state}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{state}</span>
                            <span>{percent.toFixed(1)}%</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="holdings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
                <CardDescription>Detailed view of all positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Issuer</th>
                        <th className="text-left py-2">Details</th>
                        <th className="text-right py-2">Quantity</th>
                        <th className="text-right py-2">Cost Basis</th>
                        <th className="text-right py-2">Current Value</th>
                        <th className="text-right py-2">Gain/Loss</th>
                        <th className="text-right py-2">Yield</th>
                        <th className="text-right py-2">ATYTW</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => {
                        const costBasis = holding.quantity * holding.purchasePrice / 100
                        const currentValue = holding.quantity * holding.currentPrice / 100
                        const gainLoss = currentValue - costBasis
                        const gainLossPercent = (gainLoss / costBasis) * 100

                        return (
                          <tr key={holding.id} className="border-b">
                            <td className="py-3">
                              <div className="font-medium">{holding.bond.issuerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {holding.bond.cusip}
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="text-sm">
                                {holding.bond.coupon}% • {new Date(holding.bond.maturity).getFullYear()}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {holding.bond.ratingBucket}
                                </Badge>
                                {holding.bond.callable && (
                                  <Badge variant="secondary" className="text-xs">
                                    Callable
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="text-right py-3">
                              ${holding.quantity.toLocaleString()}
                            </td>
                            <td className="text-right py-3">
                              ${costBasis.toLocaleString()}
                              <div className="text-xs text-muted-foreground">
                                @{holding.purchasePrice}
                              </div>
                            </td>
                            <td className="text-right py-3">
                              ${currentValue.toLocaleString()}
                              <div className="text-xs text-muted-foreground">
                                @{holding.currentPrice}
                              </div>
                            </td>
                            <td className={`text-right py-3 ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString()}
                              <div className="text-xs">
                                {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                              </div>
                            </td>
                            <td className="text-right py-3">
                              {holding.currentYield.toFixed(2)}%
                            </td>
                            <td className="text-right py-3 font-semibold">
                              {holding.atytw.toFixed(2)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Value Over Time</CardTitle>
                  <CardDescription>Historical performance tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                          label: 'Portfolio Value',
                          data: [170000, 172000, 175000, 178000, 179500, 180000],
                          borderColor: 'rgba(251, 146, 60, 1)',
                          backgroundColor: 'rgba(251, 146, 60, 0.1)',
                          tension: 0.3,
                        }],
                      }}
                      options={chartOptions}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Income Analysis</CardTitle>
                  <CardDescription>Monthly income projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Current Monthly Income</span>
                        <span className="text-sm font-semibold">
                          ${metrics?.monthlyIncome.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Tax-Exempt Income</span>
                        <span className="text-sm">
                          ${((metrics?.monthlyIncome || 0) * 0.75).toLocaleString()}
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Taxable Income</span>
                        <span className="text-sm">
                          ${((metrics?.monthlyIncome || 0) * 0.25).toLocaleString()}
                        </span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Projected Annual Income</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Gross Income:</span>
                        <p className="font-semibold">${metrics?.annualIncome.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">After-Tax Income:</span>
                        <p className="font-semibold">
                          ${((metrics?.annualIncome || 0) * 0.85).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Profile</CardTitle>
                  <CardDescription>Multi-dimensional risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Radar data={riskData} options={radarOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Breakdown</CardTitle>
                  <CardDescription>Detailed risk analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium">Concentration Risk</span>
                        </div>
                        <Badge variant="default">Low</Badge>
                      </div>
                      <Progress value={riskMetrics?.concentrationRisk || 0} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Well diversified across issuers and sectors
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Duration Risk</span>
                        </div>
                        <Badge variant="secondary">Moderate</Badge>
                      </div>
                      <Progress value={riskMetrics?.durationRisk || 0} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Average duration of {metrics?.averageDuration.toFixed(1)} years
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Credit Risk</span>
                        </div>
                        <Badge variant="default">Low</Badge>
                      </div>
                      <Progress value={riskMetrics?.creditRisk || 0} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        High quality bonds with {metrics?.averageRating} average rating
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Liquidity Risk</span>
                        </div>
                        <Badge variant="default">Low</Badge>
                      </div>
                      <Progress value={riskMetrics?.liquidityRisk || 0} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mostly liquid municipal and treasury bonds
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-sm">Overall Assessment</h4>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your portfolio shows a conservative risk profile with good diversification 
                      and high credit quality. Consider monitoring interest rate risk given the 
                      moderate duration exposure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
