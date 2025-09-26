import { BrokerPosition } from './brokers/types'
import prisma from '@/lib/prisma'

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
  subcategory?: string
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
  bonds?: RecommendedBond[]
  expectedImpact: {
    yieldChange: number
    riskChange: number
    allocationChange: number
  }
}

interface RecommendedBond {
  cusip: string
  issuerName: string
  coupon: number
  maturity: string
  yield: number
  rating: string
  price: number
  suggestedAmount: number
  rationale: string
}

interface UserProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentHorizon: number // years
  taxBracket: number
  targetAllocations: {
    bonds: number
    stocks: number
    cash: number
    alternatives: number
  }
  bondPreferences: {
    minRating: string
    maxMaturity: number
    preferTaxExempt: boolean
    sectors: string[]
  }
}

export class PortfolioAnalyzer {
  /**
   * Analyze portfolio and identify gaps
   */
  static async analyzePortfolio(
    positions: BrokerPosition[],
    userProfile: UserProfile
  ): Promise<PortfolioAnalysis> {
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
    
    // Calculate current allocations
    const allocations = this.calculateAllocations(positions, totalValue)
    
    // Identify gaps
    const gaps = this.identifyGaps(allocations, userProfile, totalValue)
    
    // Calculate risk and diversification scores
    const riskScore = this.calculateRiskScore(positions, userProfile)
    const diversificationScore = this.calculateDiversificationScore(positions)
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      positions,
      gaps,
      userProfile
    )

    return {
      totalValue,
      bondAllocation: allocations.bonds,
      cashAllocation: allocations.cash,
      otherAllocation: allocations.other,
      gaps,
      riskScore,
      diversificationScore,
      recommendations,
    }
  }

  /**
   * Calculate current allocations by asset type
   */
  private static calculateAllocations(
    positions: BrokerPosition[],
    totalValue: number
  ): Record<string, number> {
    const allocations = {
      bonds: 0,
      stocks: 0,
      cash: 0,
      other: 0,
    }

    positions.forEach(position => {
      const allocation = (position.marketValue / totalValue) * 100
      
      switch (position.assetType) {
        case 'BOND':
          allocations.bonds += allocation
          break
        case 'STOCK':
          allocations.stocks += allocation
          break
        case 'CASH':
          allocations.cash += allocation
          break
        default:
          allocations.other += allocation
      }
    })

    return allocations
  }

  /**
   * Identify portfolio gaps based on target allocations
   */
  private static identifyGaps(
    currentAllocations: Record<string, number>,
    userProfile: UserProfile,
    totalValue: number
  ): PortfolioGap[] {
    const gaps: PortfolioGap[] = []
    const targetAllocations = userProfile.targetAllocations

    // Main asset class gaps
    Object.entries(targetAllocations).forEach(([asset, target]) => {
      const current = currentAllocations[asset] || 0
      const gap = target - current
      const gapValue = (gap / 100) * totalValue

      if (Math.abs(gap) > 2) { // Only report gaps > 2%
        gaps.push({
          category: asset.charAt(0).toUpperCase() + asset.slice(1),
          currentAllocation: current,
          targetAllocation: target,
          gap,
          gapValue,
          severity: Math.abs(gap) > 10 ? 'high' : Math.abs(gap) > 5 ? 'medium' : 'low',
        })
      }
    })

    // Bond subcategory analysis (if bonds are underallocated)
    const bondGap = targetAllocations.bonds - (currentAllocations.bonds || 0)
    if (bondGap > 5) {
      // Add subcategory recommendations
      gaps.push({
        category: 'Bonds',
        subcategory: 'Municipal Bonds',
        currentAllocation: 0, // Would need actual data
        targetAllocation: bondGap * 0.6, // Suggest 60% munis for tax efficiency
        gap: bondGap * 0.6,
        gapValue: (bondGap * 0.6 / 100) * totalValue,
        severity: 'medium',
      })

      gaps.push({
        category: 'Bonds',
        subcategory: 'Corporate Bonds',
        currentAllocation: 0,
        targetAllocation: bondGap * 0.3,
        gap: bondGap * 0.3,
        gapValue: (bondGap * 0.3 / 100) * totalValue,
        severity: 'low',
      })

      gaps.push({
        category: 'Bonds',
        subcategory: 'Treasury Bonds',
        currentAllocation: 0,
        targetAllocation: bondGap * 0.1,
        gap: bondGap * 0.1,
        gapValue: (bondGap * 0.1 / 100) * totalValue,
        severity: 'low',
      })
    }

    return gaps.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
  }

  /**
   * Calculate portfolio risk score (0-100)
   */
  private static calculateRiskScore(
    positions: BrokerPosition[],
    userProfile: UserProfile
  ): number {
    let riskScore = 50 // Base score

    // Factor in asset allocation
    const bondPositions = positions.filter(p => p.assetType === 'BOND')
    const stockPositions = positions.filter(p => p.assetType === 'STOCK')

    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
    const bondRatio = bondPositions.reduce((sum, p) => sum + p.marketValue, 0) / totalValue
    const stockRatio = stockPositions.reduce((sum, p) => sum + p.marketValue, 0) / totalValue

    // Higher stock allocation = higher risk
    riskScore += stockRatio * 30
    // Lower bond allocation = higher risk
    riskScore -= bondRatio * 20

    // Adjust based on user's risk tolerance
    const toleranceAdjustment = {
      conservative: -20,
      moderate: 0,
      aggressive: 20,
    }
    riskScore += toleranceAdjustment[userProfile.riskTolerance]

    // Factor in bond quality (if available)
    // This would need actual rating data
    const avgBondQuality = 0.8 // Placeholder
    riskScore -= avgBondQuality * 10

    return Math.max(0, Math.min(100, riskScore))
  }

  /**
   * Calculate diversification score (0-100)
   */
  private static calculateDiversificationScore(positions: BrokerPosition[]): number {
    // Simple Herfindahl-Hirschman Index calculation
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
    const concentrations = positions.map(p => Math.pow(p.marketValue / totalValue, 2))
    const hhi = concentrations.reduce((sum, c) => sum + c, 0)
    
    // Convert HHI to 0-100 score (lower HHI = better diversification)
    const diversificationScore = (1 - hhi) * 100

    // Additional factors
    const uniqueIssuers = new Set(positions.map(p => p.description.split(' ')[0])).size
    const issuerBonus = Math.min(20, uniqueIssuers * 2)

    return Math.min(100, diversificationScore + issuerBonus)
  }

  /**
   * Generate AI-powered recommendations
   */
  private static async generateRecommendations(
    positions: BrokerPosition[],
    gaps: PortfolioGap[],
    userProfile: UserProfile
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Address high-severity gaps first
    const highSeverityGaps = gaps.filter(g => g.severity === 'high')
    
    for (const gap of highSeverityGaps) {
      if (gap.category === 'Bonds' && gap.gap > 0) {
        // Need to buy more bonds
        const bondRecs = await this.findBondRecommendations(
          gap.gapValue,
          userProfile
        )

        recommendations.push({
          type: 'BUY',
          priority: 'high',
          category: 'Asset Allocation',
          description: `Your bond allocation is ${gap.gap.toFixed(1)}% below target. Consider adding bonds to reduce portfolio risk.`,
          bonds: bondRecs,
          expectedImpact: {
            yieldChange: 0.5, // Estimate
            riskChange: -gap.gap * 0.5, // Bonds reduce risk
            allocationChange: gap.gap,
          },
        })
      } else if (gap.category === 'Stocks' && gap.gap < 0) {
        // Overallocated to stocks
        recommendations.push({
          type: 'REBALANCE',
          priority: 'high',
          category: 'Risk Management',
          description: `Your stock allocation is ${Math.abs(gap.gap).toFixed(1)}% above target. Consider rebalancing to manage risk.`,
          expectedImpact: {
            yieldChange: 0.3,
            riskChange: gap.gap * 0.5,
            allocationChange: gap.gap,
          },
        })
      }
    }

    // Duration risk analysis
    const bondPositions = positions.filter(p => p.assetType === 'BOND')
    if (bondPositions.length > 0) {
      const avgMaturity = this.calculateAverageMaturity(bondPositions)
      if (avgMaturity > 10 && userProfile.riskTolerance === 'conservative') {
        recommendations.push({
          type: 'REBALANCE',
          priority: 'medium',
          category: 'Duration Risk',
          description: 'Your bond portfolio has high duration risk. Consider adding shorter-term bonds.',
          expectedImpact: {
            yieldChange: -0.2,
            riskChange: -5,
            allocationChange: 0,
          },
        })
      }
    }

    // Tax optimization
    if (userProfile.taxBracket > 0.3) {
      const taxableBonds = bondPositions.filter(p => !p.description.includes('Municipal'))
      if (taxableBonds.length > 0) {
        recommendations.push({
          type: 'REBALANCE',
          priority: 'medium',
          category: 'Tax Optimization',
          description: 'Consider tax-exempt municipal bonds given your tax bracket.',
          expectedImpact: {
            yieldChange: 0.3, // After-tax improvement
            riskChange: 0,
            allocationChange: 0,
          },
        })
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Find specific bond recommendations
   */
  private static async findBondRecommendations(
    targetAmount: number,
    userProfile: UserProfile
  ): Promise<RecommendedBond[]> {
    // Query database for suitable bonds
    const bonds = await prisma.bond.findMany({
      where: {
        ratingBucket: {
          in: this.getRatingFilter(userProfile.bondPreferences.minRating),
        },
        maturity: {
          lte: new Date(Date.now() + userProfile.bondPreferences.maxMaturity * 365 * 24 * 60 * 60 * 1000),
        },
        federalTaxExempt: userProfile.bondPreferences.preferTaxExempt,
      },
      include: {
        marketData: {
          orderBy: { asOf: 'desc' },
          take: 1,
        },
      },
      take: 10,
    })

    return bonds
      .filter(bond => bond.marketData.length > 0)
      .map(bond => {
        const marketData = bond.marketData[0]
        const suggestedAmount = Math.min(targetAmount * 0.2, 50000) // Max 20% in one bond

        return {
          cusip: bond.cusip,
          issuerName: bond.issuerName,
          coupon: bond.coupon,
          maturity: bond.maturity.toISOString(),
          yield: marketData.yieldToWorst,
          rating: bond.ratingBucket || 'NR',
          price: marketData.price,
          suggestedAmount,
          rationale: this.generateBondRationale(bond, userProfile),
        }
      })
      .slice(0, 5) // Top 5 recommendations
  }

  /**
   * Generate rationale for bond recommendation
   */
  private static generateBondRationale(bond: any, userProfile: UserProfile): string {
    const reasons = []

    if (bond.federalTaxExempt && userProfile.taxBracket > 0.3) {
      reasons.push('Tax-exempt status provides better after-tax yield')
    }

    if (bond.ratingBucket && ['AAA', 'AA+', 'AA'].includes(bond.ratingBucket)) {
      reasons.push('High credit quality aligns with conservative approach')
    }

    const yearsToMaturity = (new Date(bond.maturity).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)
    if (yearsToMaturity < 5) {
      reasons.push('Short maturity reduces interest rate risk')
    }

    if (bond.sector === 'general-obligation') {
      reasons.push('General obligation bonds offer strong government backing')
    }

    return reasons.join('. ') || 'Diversification benefit'
  }

  /**
   * Get rating filter based on minimum rating
   */
  private static getRatingFilter(minRating: string): string[] {
    const allRatings = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-']
    const minIndex = allRatings.indexOf(minRating)
    return minIndex >= 0 ? allRatings.slice(0, minIndex + 1) : allRatings
  }

  /**
   * Calculate average maturity of bond positions
   */
  private static calculateAverageMaturity(bondPositions: BrokerPosition[]): number {
    const totalValue = bondPositions.reduce((sum, p) => sum + p.marketValue, 0)
    let weightedMaturity = 0

    bondPositions.forEach(position => {
      if (position.maturityDate) {
        const yearsToMaturity = (position.maturityDate.getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)
        weightedMaturity += (position.marketValue / totalValue) * yearsToMaturity
      }
    })

    return weightedMaturity
  }
}
