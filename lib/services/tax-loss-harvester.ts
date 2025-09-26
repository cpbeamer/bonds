import { BrokerPosition, BrokerTransaction } from './brokers/types'
import prisma from '@/lib/prisma'

interface TaxLossHarvestingOpportunity {
  position: BrokerPosition
  unrealizedLoss: number
  holdingPeriod: 'short' | 'long'
  daysSincePurchase: number
  washSaleRisk: boolean
  replacementSuggestions: ReplacementBond[]
  taxSavings: {
    federal: number
    state: number
    total: number
  }
  recommendedAction: 'HARVEST_NOW' | 'WAIT_FOR_LONG_TERM' | 'HOLD'
  rationale: string
}

interface ReplacementBond {
  cusip: string
  issuerName: string
  similarity: number // 0-100 score
  yield: number
  rating: string
  maturity: string
  price: number
  differences: string[]
}

interface TaxProfile {
  federalRate: number
  stateRate: number
  shortTermCapitalGainsRate: number
  longTermCapitalGainsRate: number
  hasCapitalGains: boolean
  capitalGainsAmount: number
  carryforwardLosses: number
}

export class TaxLossHarvester {
  /**
   * Analyze portfolio for tax loss harvesting opportunities
   */
  static async analyzeOpportunities(
    positions: BrokerPosition[],
    transactions: BrokerTransaction[],
    taxProfile: TaxProfile
  ): Promise<TaxLossHarvestingOpportunity[]> {
    const opportunities: TaxLossHarvestingOpportunity[] = []

    // Group transactions by position
    const transactionsBySymbol = this.groupTransactionsBySymbol(transactions)

    for (const position of positions) {
      if (position.assetType !== 'BOND' || position.unrealizedGainLoss >= 0) {
        continue // Skip non-bonds and gains
      }

      const positionTransactions = transactionsBySymbol[position.symbol] || []
      const purchaseDate = this.getOldestPurchaseDate(positionTransactions)
      const daysSincePurchase = this.daysBetween(purchaseDate, new Date())
      const holdingPeriod = daysSincePurchase > 365 ? 'long' : 'short'

      // Check for wash sale risk
      const washSaleRisk = this.checkWashSaleRisk(position, transactions)

      // Calculate tax savings
      const taxSavings = this.calculateTaxSavings(
        Math.abs(position.unrealizedGainLoss),
        holdingPeriod,
        taxProfile
      )

      // Find replacement bonds
      const replacements = await this.findReplacementBonds(position)

      // Determine recommended action
      const recommendedAction = this.determineAction(
        position,
        holdingPeriod,
        daysSincePurchase,
        taxSavings.total,
        washSaleRisk
      )

      // Generate rationale
      const rationale = this.generateRationale(
        position,
        holdingPeriod,
        daysSincePurchase,
        taxSavings,
        washSaleRisk,
        recommendedAction
      )

      opportunities.push({
        position,
        unrealizedLoss: Math.abs(position.unrealizedGainLoss),
        holdingPeriod,
        daysSincePurchase,
        washSaleRisk,
        replacementSuggestions: replacements,
        taxSavings,
        recommendedAction,
        rationale,
      })
    }

    // Sort by tax savings potential
    return opportunities.sort((a, b) => b.taxSavings.total - a.taxSavings.total)
  }

  /**
   * Group transactions by symbol
   */
  private static groupTransactionsBySymbol(
    transactions: BrokerTransaction[]
  ): Record<string, BrokerTransaction[]> {
    return transactions.reduce((acc, transaction) => {
      if (transaction.symbol) {
        if (!acc[transaction.symbol]) {
          acc[transaction.symbol] = []
        }
        acc[transaction.symbol].push(transaction)
      }
      return acc
    }, {} as Record<string, BrokerTransaction[]>)
  }

  /**
   * Get oldest purchase date for a position
   */
  private static getOldestPurchaseDate(transactions: BrokerTransaction[]): Date {
    const buyTransactions = transactions
      .filter(t => t.type === 'BUY')
      .sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime())

    return buyTransactions[0]?.transactionDate || new Date()
  }

  /**
   * Calculate days between two dates
   */
  private static daysBetween(date1: Date, date2: Date): number {
    return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Check for wash sale risk (30 days before/after)
   */
  private static checkWashSaleRisk(
    position: BrokerPosition,
    transactions: BrokerTransaction[]
  ): boolean {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Check if same or substantially identical security was purchased recently
    const recentPurchases = transactions.filter(t => 
      t.type === 'BUY' &&
      t.transactionDate > thirtyDaysAgo &&
      (t.symbol === position.symbol || this.isSubstantiallyIdentical(t.cusip, position.cusip))
    )

    return recentPurchases.length > 0
  }

  /**
   * Check if two securities are substantially identical (for wash sale rules)
   */
  private static isSubstantiallyIdentical(cusip1?: string, cusip2?: string): boolean {
    if (!cusip1 || !cusip2) return false
    
    // Simple check: same issuer (first 6 chars of CUSIP)
    return cusip1.substring(0, 6) === cusip2.substring(0, 6)
  }

  /**
   * Calculate tax savings from harvesting a loss
   */
  private static calculateTaxSavings(
    loss: number,
    holdingPeriod: 'short' | 'long',
    taxProfile: TaxProfile
  ): { federal: number; state: number; total: number } {
    let effectiveLoss = loss

    // Apply against capital gains first
    if (taxProfile.hasCapitalGains && taxProfile.capitalGainsAmount > 0) {
      const offsetAmount = Math.min(loss, taxProfile.capitalGainsAmount)
      effectiveLoss = loss - offsetAmount
    }

    // Remaining loss can offset up to $3,000 of ordinary income
    const ordinaryIncomeOffset = Math.min(effectiveLoss, 3000)

    // Calculate tax rate based on holding period
    const federalRate = holdingPeriod === 'short' 
      ? taxProfile.shortTermCapitalGainsRate 
      : taxProfile.longTermCapitalGainsRate

    const federal = loss * federalRate
    const state = loss * taxProfile.stateRate
    const total = federal + state

    return { federal, state, total }
  }

  /**
   * Find replacement bonds to avoid wash sale
   */
  private static async findReplacementBonds(
    position: BrokerPosition
  ): Promise<ReplacementBond[]> {
    if (!position.cusip) return []

    // Get the original bond details
    const originalBond = await prisma.bond.findUnique({
      where: { cusip: position.cusip },
      include: {
        marketData: {
          orderBy: { asOf: 'desc' },
          take: 1,
        },
      },
    })

    if (!originalBond) return []

    // Find similar bonds but not substantially identical
    const similarBonds = await prisma.bond.findMany({
      where: {
        AND: [
          { type: originalBond.type },
          { 
            maturity: {
              gte: new Date(originalBond.maturity.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
              lte: new Date(originalBond.maturity.getTime() + 2 * 365 * 24 * 60 * 60 * 1000),
            }
          },
          { ratingBucket: originalBond.ratingBucket },
          { 
            cusip: {
              not: position.cusip,
              // Not same issuer (avoid substantially identical)
              notStartsWith: position.cusip.substring(0, 6),
            }
          },
        ],
      },
      include: {
        marketData: {
          orderBy: { asOf: 'desc' },
          take: 1,
        },
      },
      take: 10,
    })

    return similarBonds
      .filter(bond => bond.marketData.length > 0)
      .map(bond => {
        const similarity = this.calculateSimilarity(originalBond, bond)
        const differences = this.identifyDifferences(originalBond, bond)

        return {
          cusip: bond.cusip,
          issuerName: bond.issuerName,
          similarity,
          yield: bond.marketData[0].yieldToWorst,
          rating: bond.ratingBucket || 'NR',
          maturity: bond.maturity.toISOString(),
          price: bond.marketData[0].price,
          differences,
        }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
  }

  /**
   * Calculate similarity score between two bonds
   */
  private static calculateSimilarity(bond1: any, bond2: any): number {
    let score = 0

    // Same type (30 points)
    if (bond1.type === bond2.type) score += 30

    // Similar maturity (20 points)
    const maturityDiff = Math.abs(
      bond1.maturity.getTime() - bond2.maturity.getTime()
    ) / (365 * 24 * 60 * 60 * 1000) // Years
    score += Math.max(0, 20 - maturityDiff * 2)

    // Same rating (20 points)
    if (bond1.ratingBucket === bond2.ratingBucket) score += 20

    // Similar coupon (15 points)
    const couponDiff = Math.abs(bond1.coupon - bond2.coupon)
    score += Math.max(0, 15 - couponDiff * 5)

    // Same sector (15 points)
    if (bond1.sector === bond2.sector) score += 15

    return Math.min(100, score)
  }

  /**
   * Identify key differences between bonds
   */
  private static identifyDifferences(bond1: any, bond2: any): string[] {
    const differences: string[] = []

    if (bond1.issuerName !== bond2.issuerName) {
      differences.push(`Different issuer: ${bond2.issuerName}`)
    }

    const maturityDiff = Math.abs(
      bond1.maturity.getTime() - bond2.maturity.getTime()
    ) / (365 * 24 * 60 * 60 * 1000)
    if (maturityDiff > 0.5) {
      differences.push(`Maturity differs by ${maturityDiff.toFixed(1)} years`)
    }

    if (Math.abs(bond1.coupon - bond2.coupon) > 0.25) {
      differences.push(`Coupon: ${bond2.coupon}% vs ${bond1.coupon}%`)
    }

    if (bond1.sector !== bond2.sector) {
      differences.push(`Different sector: ${bond2.sector}`)
    }

    return differences
  }

  /**
   * Determine recommended action
   */
  private static determineAction(
    position: BrokerPosition,
    holdingPeriod: 'short' | 'long',
    daysSincePurchase: number,
    taxSavings: number,
    washSaleRisk: boolean
  ): 'HARVEST_NOW' | 'WAIT_FOR_LONG_TERM' | 'HOLD' {
    // Don't harvest if wash sale risk
    if (washSaleRisk) return 'HOLD'

    // If close to long-term threshold, consider waiting
    if (holdingPeriod === 'short' && daysSincePurchase > 300) {
      const daysToLongTerm = 365 - daysSincePurchase
      if (daysToLongTerm < 60 && Math.abs(position.unrealizedGainLoss) < 5000) {
        return 'WAIT_FOR_LONG_TERM'
      }
    }

    // Harvest if significant tax savings
    if (taxSavings > 500) {
      return 'HARVEST_NOW'
    }

    return 'HOLD'
  }

  /**
   * Generate rationale for recommendation
   */
  private static generateRationale(
    position: BrokerPosition,
    holdingPeriod: 'short' | 'long',
    daysSincePurchase: number,
    taxSavings: { total: number },
    washSaleRisk: boolean,
    action: 'HARVEST_NOW' | 'WAIT_FOR_LONG_TERM' | 'HOLD'
  ): string {
    const reasons: string[] = []

    if (washSaleRisk) {
      reasons.push('Wash sale rules apply - purchased similar security within 30 days')
      return reasons.join('. ')
    }

    switch (action) {
      case 'HARVEST_NOW':
        reasons.push(`Realize ${Math.abs(position.unrealizedGainLoss).toLocaleString()} loss`)
        reasons.push(`Save $${taxSavings.total.toFixed(0)} in taxes`)
        if (holdingPeriod === 'long') {
          reasons.push('Qualifies for long-term capital loss treatment')
        }
        break

      case 'WAIT_FOR_LONG_TERM':
        const daysToLongTerm = 365 - daysSincePurchase
        reasons.push(`Only ${daysToLongTerm} days until long-term treatment`)
        reasons.push('Waiting reduces tax rate on harvested loss')
        break

      case 'HOLD':
        if (taxSavings.total < 100) {
          reasons.push('Tax savings too small to justify transaction costs')
        }
        if (Math.abs(position.unrealizedGainLoss) < 1000) {
          reasons.push('Loss amount is minimal')
        }
        break
    }

    return reasons.join('. ') || 'No specific action recommended at this time'
  }
}
