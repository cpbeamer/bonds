'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Share2,
  Users,
  MessageSquare,
  TrendingUp,
  Eye,
  Heart,
  Copy,
  Send,
  Lock,
  Globe,
  UserPlus,
  X,
  ChevronRight,
  BarChart,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { theme } from '@/lib/themes'

interface SharedPortfolio {
  id: string
  title: string
  description: string
  owner: {
    id: string
    name: string
    avatar?: string
  }
  visibility: 'private' | 'public' | 'shared'
  sharedWith: string[]
  bonds: SharedBond[]
  insights: string[]
  performance: {
    totalReturn: number
    avgYield: number
    duration: number
  }
  likes: number
  views: number
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

interface SharedBond {
  cusip: string
  issuerName: string
  allocation: number
  rationale: string
  addedDate: Date
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
}

interface Community {
  id: string
  name: string
  description: string
  memberCount: number
  isPrivate: boolean
  tags: string[]
}

export default function SharePage() {
  const { user } = useUser()
  const [sharedPortfolios, setSharedPortfolios] = useState<SharedPortfolio[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<SharedPortfolio | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('discover')

  // Form state for new portfolio
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    visibility: 'private' as 'private' | 'public' | 'shared',
    bonds: [] as SharedBond[],
    insights: [] as string[],
  })

  useEffect(() => {
    fetchSharedPortfolios()
    fetchCommunities()
  }, [])

  const fetchSharedPortfolios = async () => {
    // Mock data for demonstration
    setSharedPortfolios([
      {
        id: '1',
        title: 'Conservative Municipal Bond Ladder',
        description: 'A well-diversified ladder strategy focusing on high-quality municipal bonds with staggered maturities.',
        owner: {
          id: '1',
          name: 'Sarah Chen',
          avatar: undefined,
        },
        visibility: 'public',
        sharedWith: [],
        bonds: [
          {
            cusip: 'XXXX1234',
            issuerName: 'California State GO',
            allocation: 20,
            rationale: 'Strong state backing with AA rating',
            addedDate: new Date('2024-01-15'),
          },
          {
            cusip: 'YYYY5678',
            issuerName: 'NYC Water Authority',
            allocation: 15,
            rationale: 'Essential service revenue bond',
            addedDate: new Date('2024-01-20'),
          },
        ],
        insights: [
          'Focus on general obligation bonds for stability',
          'Ladder maturities from 2-10 years for consistent cash flow',
          'Overweight essential service revenue bonds',
        ],
        performance: {
          totalReturn: 5.2,
          avgYield: 3.8,
          duration: 4.5,
        },
        likes: 24,
        views: 156,
        comments: [
          {
            id: '1',
            userId: '2',
            userName: 'Michael Ross',
            content: 'Great strategy! Have you considered adding some pre-refunded bonds for extra safety?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20'),
      },
      {
        id: '2',
        title: 'High-Yield Tax-Exempt Strategy',
        description: 'Targeting after-tax returns through strategic selection of higher-yielding municipal bonds.',
        owner: {
          id: '2',
          name: 'David Kim',
          avatar: undefined,
        },
        visibility: 'public',
        sharedWith: [],
        bonds: [
          {
            cusip: 'ZZZZ9012',
            issuerName: 'Texas Toll Road Authority',
            allocation: 25,
            rationale: 'Higher yield with solid traffic projections',
            addedDate: new Date('2024-02-01'),
          },
        ],
        insights: [
          'Balance yield with credit quality',
          'Focus on revenue bonds with stable cash flows',
          'Consider call protection in rising rate environment',
        ],
        performance: {
          totalReturn: 6.8,
          avgYield: 4.5,
          duration: 6.2,
        },
        likes: 18,
        views: 203,
        comments: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-18'),
      },
    ])
  }

  const fetchCommunities = async () => {
    setCommunities([
      {
        id: '1',
        name: 'Municipal Bond Investors',
        description: 'Dedicated to tax-exempt bond strategies and market analysis',
        memberCount: 1250,
        isPrivate: false,
        tags: ['municipal', 'tax-exempt', 'strategies'],
      },
      {
        id: '2',
        name: 'High Net Worth Strategies',
        description: 'Advanced strategies for accredited investors',
        memberCount: 450,
        isPrivate: true,
        tags: ['hnw', 'advanced', 'tax-optimization'],
      },
      {
        id: '3',
        name: 'ESG Bond Focus',
        description: 'Sustainable and socially responsible bond investing',
        memberCount: 890,
        isPrivate: false,
        tags: ['esg', 'green-bonds', 'impact'],
      },
    ])
  }

  const createPortfolio = async () => {
    try {
      // API call would go here
      toast.success('Portfolio shared successfully!')
      setShowCreateDialog(false)
      // Reset form
      setNewPortfolio({
        title: '',
        description: '',
        visibility: 'private',
        bonds: [],
        insights: [],
      })
    } catch (error) {
      toast.error('Failed to share portfolio')
    }
  }

  const likePortfolio = async (portfolioId: string) => {
    setSharedPortfolios(portfolios =>
      portfolios.map(p =>
        p.id === portfolioId ? { ...p, likes: p.likes + 1 } : p
      )
    )
    toast.success('Added to favorites')
  }

  const copyPortfolio = async (portfolio: SharedPortfolio) => {
    toast.success('Portfolio copied to your account')
  }

  const joinCommunity = async (communityId: string) => {
    toast.success('Joined community successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-transparent dark:to-transparent dark:bg-background">
      <main className={`${theme.layout.container.margin} ${theme.layout.container.padding} ${theme.layout.page.padding}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50">
              Community & Sharing
            </h1>
            <p className="text-gray-600 dark:text-neutral-300 mt-1">
              Share strategies and learn from other investors
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Share2 className="w-4 h-4" />
                Share Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Share Portfolio Strategy</DialogTitle>
                <DialogDescription>
                  Share your bond portfolio insights with the community
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Portfolio Title</Label>
                  <Input
                    id="title"
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                    placeholder="e.g., Conservative Tax-Exempt Strategy"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                    placeholder="Describe your strategy and approach..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Visibility</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={newPortfolio.visibility === 'private' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewPortfolio({ ...newPortfolio, visibility: 'private' })}
                      className="flex-1"
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      Private
                    </Button>
                    <Button
                      variant={newPortfolio.visibility === 'shared' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewPortfolio({ ...newPortfolio, visibility: 'shared' })}
                      className="flex-1"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Shared
                    </Button>
                    <Button
                      variant={newPortfolio.visibility === 'public' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewPortfolio({ ...newPortfolio, visibility: 'public' })}
                      className="flex-1"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Public
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createPortfolio}>
                  Share Portfolio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="my-shared">My Shared</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sharedPortfolios.map((portfolio) => (
                <Card key={portfolio.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{portfolio.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={portfolio.owner.avatar} />
                            <AvatarFallback>{portfolio.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {portfolio.owner.name}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(portfolio.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant={portfolio.visibility === 'public' ? 'default' : 'secondary'}>
                        {portfolio.visibility}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {portfolio.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {portfolio.performance.totalReturn}%
                        </p>
                        <p className="text-xs text-muted-foreground">Total Return</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{portfolio.performance.avgYield}%</p>
                        <p className="text-xs text-muted-foreground">Avg Yield</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{portfolio.performance.duration}</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {portfolio.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {portfolio.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {portfolio.comments.length}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => likePortfolio(portfolio.id)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyPortfolio(portfolio)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPortfolio(portfolio)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="communities" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.map((community) => (
                <Card key={community.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      {community.isPrivate && (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>{community.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {community.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        <Users className="w-4 h-4 inline mr-1" />
                        {community.memberCount} members
                      </span>
                      <Button
                        size="sm"
                        onClick={() => joinCommunity(community.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-shared" className="mt-6">
            <div className="text-center py-12">
              <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Shared Portfolios Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start sharing your investment strategies with the community
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Share Your First Portfolio
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Portfolio Detail Modal */}
        {selectedPortfolio && (
          <Dialog open={!!selectedPortfolio} onOpenChange={() => setSelectedPortfolio(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedPortfolio.title}</DialogTitle>
                <DialogDescription>
                  Shared by {selectedPortfolio.owner.name} • {new Date(selectedPortfolio.updatedAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Strategy Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPortfolio.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <ul className="space-y-2">
                    {selectedPortfolio.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Bond Holdings</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issuer</TableHead>
                        <TableHead>Allocation</TableHead>
                        <TableHead>Rationale</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPortfolio.bonds.map((bond) => (
                        <TableRow key={bond.cusip}>
                          <TableCell>{bond.issuerName}</TableCell>
                          <TableCell>{bond.allocation}%</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {bond.rationale}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Comments</h4>
                  <div className="space-y-3">
                    {selectedPortfolio.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.userAvatar} />
                          <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Input placeholder="Add a comment..." className="flex-1" />
                    <Button>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
