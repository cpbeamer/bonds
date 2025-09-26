'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Building2,
  Link2,
  Unlink,
  RefreshCw,
  TrendingUp,
  DollarSign,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Lightbulb,
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'
import { theme } from '@/lib/themes'

interface ConnectedBroker {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
  accounts: BrokerAccount[]
}

interface BrokerAccount {
  id: string
  accountNumber: string
  accountType: string
  accountName: string
  totalValue: number
  cashBalance: number
  positions: number
}

interface PortfolioAnalysis {
  totalValue: number
  bondAllocation: number
  cashAllocation: number
  otherAllocation: number
  gaps: PortfolioGap[]
  riskScore: number
  diversificationScore: number
  recommendations: Recommendation[]
}

interface PortfolioGap {
  category: string
  currentAllocation: number
  targetAllocation: number
  gap: number
  gapValue: number
  severity: 'low' | 'medium' | 'high'
}

interface Recommendation {
  type: 'BUY' | 'SELL' | 'REBALANCE' | 'HOLD'
  priority: 'low' | 'medium' | 'high'
  category: string
  description: string
  expectedImpact: {
    yieldChange: number
    riskChange: number
    allocationChange: number
  }
}

export default function BrokersPage() {
  const { user } = useUser()
  const [connectedBrokers, setConnectedBrokers] = useState<ConnectedBroker[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchConnectedBrokers()
  }, [])

  const fetchConnectedBrokers = async () => {
    try {
      // Mock data for demonstration
      setConnectedBrokers([
        {
          id: 'fidelity',
          name: 'Fidelity',
          status: 'connected',
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          accounts: [
            {
              id: 'fid-001',
              accountNumber: '****1234',
              accountType: 'Individual',
              accountName: 'Investment Account',
              totalValue: 250000,
              cashBalance: 12500,
              positions: 15,
            },
            {
              id: 'fid-002',
              accountNumber: '****5678',
              accountType: 'IRA',
              accountName: 'Traditional IRA',
              totalValue: 180000,
              cashBalance: 5000,
              positions: 12,
            },
          ],
        },
      ])

      // Mock analysis data
      setAnalysis({
        totalValue: 430000,
        bondAllocation: 35,
        cashBalance: 4.0,
        otherAllocation: 61,
        gaps: [
          {
            category: 'Bonds',
            currentAllocation: 35,
            targetAllocation: 60,
            gap: 25,
            gapValue: 107500,
            severity: 'high',
          },
          {
            category: 'International Bonds',
            currentAllocation: 0,
            targetAllocation: 10,
            gap: 10,
            gapValue: 43000,
            severity: 'medium',
          },
          {
            category: 'Cash',
            currentAllocation: 4,
            targetAllocation: 5,
            gap: 1,
            gapValue: 4300,
            severity: 'low',
          },
        ],
        riskScore: 72,
        diversificationScore: 68,
        recommendations: [
          {
            type: 'BUY',
            priority: 'high',
            category: 'Asset Allocation',
            description: 'Your bond allocation is 25% below target. Consider adding high-quality municipal and corporate bonds to reduce portfolio risk.',
            expectedImpact: {
              yieldChange: 0.8,
              riskChange: -15,
              allocationChange: 25,
            },
          },
          {
            type: 'REBALANCE',
            priority: 'medium',
            category: 'Tax Optimization',
            description: 'With your tax bracket, municipal bonds could provide better after-tax yields. Consider replacing taxable bonds.',
            expectedImpact: {
              yieldChange: 0.4,
              riskChange: 0,
              allocationChange: 0,
            },
          },
          {
            type: 'BUY',
            priority: 'medium',
            category: 'Diversification',
            description: 'Add international bonds for geographic diversification and currency hedging benefits.',
            expectedImpact: {
              yieldChange: 0.2,
              riskChange: -5,
              allocationChange: 10,
            },
          },
        ],
      })
    } catch (error) {
      console.error('Error fetching brokers:', error)
      toast.error('Failed to load broker connections')
    }
  }

  const connectBroker = async (brokerName: string) => {
    try {
      // In real implementation, this would redirect to OAuth flow
      const authUrl = `/api/brokers/${brokerName.toLowerCase()}/auth`
      window.location.href = authUrl
    } catch (error) {
      console.error('Error connecting broker:', error)
      toast.error('Failed to connect broker')
    }
  }

  const disconnectBroker = async (brokerId: string) => {
    try {
      const response = await fetch(`/api/brokers/${brokerId}/disconnect`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to disconnect')

      setConnectedBrokers(connectedBrokers.filter(b => b.id !== brokerId))
      toast.success('Broker disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting broker:', error)
      toast.error('Failed to disconnect broker')
    }
  }

  const syncAccount = async (accountId: string) => {
    setSyncing(true)
    try {
      const response = await fetch(`/api/brokers/accounts/${accountId}/sync`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to sync')

      await fetchConnectedBrokers()
      toast.success('Account synced successfully')
    } catch (error) {
      console.error('Error syncing account:', error)
      toast.error('Failed to sync account')
    } finally {
      setSyncing(false)
    }
  }

  const getGapIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'SELL':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      case 'REBALANCE':
        return <Activity className="w-4 h-4 text-blue-500" />
      case 'HOLD':
        return <Shield className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-transparent dark:to-transparent dark:bg-background">
      <main className={`${theme.layout.container.margin} ${theme.layout.container.padding} ${theme.layout.page.padding}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50">
            Broker Integration
          </h1>
          <p className="text-gray-600 dark:text-neutral-300 mt-1">
            Connect your brokerage accounts for AI-powered portfolio analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Available Brokers */}
          <Card>
            <CardHeader>
              <CardTitle>Available Brokers</CardTitle>
              <CardDescription>Connect your brokerage accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Fidelity', 'Charles Schwab', 'Vanguard', 'E*TRADE'].map((broker) => {
                const isConnected = connectedBrokers.some(b => b.name === broker)
                return (
                  <div
                    key={broker}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{broker}</p>
                        {broker === 'Fidelity' && (
                          <p className="text-xs text-muted-foreground">OAuth integration ready</p>
                        )}
                      </div>
                    </div>
                    {isConnected ? (
                      <Badge variant="default" className="bg-green-500">
                        Connected
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => connectBroker(broker)}
                        disabled={broker !== 'Fidelity'}
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Connected Accounts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your linked brokerage accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {connectedBrokers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No brokers connected yet</p>
                  <p className="text-sm mt-2">Connect a broker to analyze your portfolio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedBrokers.map((broker) => (
                    <div key={broker.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{broker.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last synced: {broker.lastSync ? 
                              new Date(broker.lastSync).toLocaleString() : 
                              'Never'
                            }
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncAccount(broker.accounts[0]?.id)}
                            disabled={syncing}
                          >
                            <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                            Sync
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => disconnectBroker(broker.id)}
                          >
                            <Unlink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {broker.accounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted/70 transition-colors"
                            onClick={() => setSelectedAccount(account.id)}
                          >
                            <div>
                              <p className="font-medium text-sm">{account.accountName}</p>
                              <p className="text-xs text-muted-foreground">
                                {account.accountType} • {account.accountNumber}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${account.totalValue.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">
                                {account.positions} positions
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Analysis */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle>AI Portfolio Analysis</CardTitle>
              <CardDescription>
                Intelligent insights and recommendations for your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="gaps" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="gaps">Portfolio Gaps</TabsTrigger>
                  <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                  <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="gaps" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Total Portfolio</span>
                          <DollarSign className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold">${analysis.totalValue.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Bond Allocation</span>
                          <PieChart className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold">{analysis.bondAllocation}%</p>
                        <Progress value={analysis.bondAllocation} className="h-2 mt-2" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Gap Value</span>
                          <Target className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold">
                          ${analysis.gaps.reduce((sum, g) => sum + Math.abs(g.gapValue), 0).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Identified Gaps</h3>
                    {analysis.gaps.map((gap, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getGapIcon(gap.severity)}
                            <h4 className="font-medium">{gap.category}</h4>
                          </div>
                          <Badge
                            variant={gap.severity === 'high' ? 'destructive' : 
                                   gap.severity === 'medium' ? 'secondary' : 'default'}
                          >
                            {gap.severity}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Current</p>
                            <p className="font-semibold">{gap.currentAllocation}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="font-semibold">{gap.targetAllocation}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Gap</p>
                            <p className={`font-semibold ${gap.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {gap.gap > 0 ? '+' : ''}{gap.gap}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress 
                            value={(gap.currentAllocation / gap.targetAllocation) * 100} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            ${Math.abs(gap.gapValue).toLocaleString()} to reach target
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>AI-Powered Insights</AlertTitle>
                    <AlertDescription>
                      Based on your portfolio analysis, tax situation, and market conditions
                    </AlertDescription>
                  </Alert>

                  {analysis.recommendations.map((rec, index) => (
                    <Card key={index} className={`border-l-4 ${
                      rec.priority === 'high' ? 'border-l-red-500' :
                      rec.priority === 'medium' ? 'border-l-yellow-500' :
                      'border-l-green-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getRecommendationIcon(rec.type)}
                            <div>
                              <h4 className="font-semibold">{rec.category}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {rec.type}
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            variant={rec.priority === 'high' ? 'destructive' : 
                                   rec.priority === 'medium' ? 'secondary' : 'default'}
                          >
                            {rec.priority} priority
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.description}
                        </p>

                        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Yield Impact</p>
                            <p className={`font-semibold text-sm ${
                              rec.expectedImpact.yieldChange > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {rec.expectedImpact.yieldChange > 0 ? '+' : ''}
                              {rec.expectedImpact.yieldChange}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Risk Impact</p>
                            <p className={`font-semibold text-sm ${
                              rec.expectedImpact.riskChange < 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {rec.expectedImpact.riskChange > 0 ? '+' : ''}
                              {rec.expectedImpact.riskChange}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Allocation</p>
                            <p className="font-semibold text-sm">
                              {rec.expectedImpact.allocationChange > 0 ? '+' : ''}
                              {rec.expectedImpact.allocationChange}%
                            </p>
                          </div>
                        </div>

                        <Button className="w-full mt-3" variant="outline">
                          View Specific Bonds
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="risk" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">Risk Score</h4>
                        <div className="relative h-32 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-4xl font-bold">{analysis.riskScore}</p>
                            <p className="text-sm text-muted-foreground">out of 100</p>
                            <Badge variant={analysis.riskScore > 70 ? 'destructive' : 
                                         analysis.riskScore > 40 ? 'secondary' : 'default'} 
                                  className="mt-2">
                              {analysis.riskScore > 70 ? 'High Risk' : 
                               analysis.riskScore > 40 ? 'Moderate Risk' : 'Low Risk'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">Diversification Score</h4>
                        <div className="relative h-32 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-4xl font-bold">{analysis.diversificationScore}</p>
                            <p className="text-sm text-muted-foreground">out of 100</p>
                            <Badge variant={analysis.diversificationScore < 50 ? 'destructive' : 
                                         analysis.diversificationScore < 75 ? 'secondary' : 'default'} 
                                  className="mt-2">
                              {analysis.diversificationScore < 50 ? 'Poor' : 
                               analysis.diversificationScore < 75 ? 'Fair' : 'Good'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4">Risk Factors</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Interest Rate Risk</span>
                          </div>
                          <Badge variant="secondary">Moderate</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Credit Risk</span>
                          </div>
                          <Badge variant="default">Low</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">Concentration Risk</span>
                          </div>
                          <Badge variant="secondary">Moderate</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
