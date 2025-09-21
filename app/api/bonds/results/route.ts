import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { calculateATYTW } from '@/lib/calculations/atytw'
import { calculateStabilityScore, calculateLiquidityScore } from '@/lib/calculations/scoring'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        settings: true,
        runs: {
          orderBy: { ranAt: 'desc' },
          take: 1,
          include: {
            results: {
              include: {
                bond: {
                  include: {
                    marketData: {
                      orderBy: { asOf: 'desc' },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user || !user.settings) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const latestRun = user.runs[0]

    if (!latestRun || latestRun.results.length === 0) {
      const bonds = await prisma.bond.findMany({
        where: {
          ratingBucket: {
            gte: user.settings.ratingFloor
          },
          marketData: {
            some: {
              price: {
                gte: user.settings.priceFloor
              },
              yieldToWorst: {
                gte: user.settings.ytwFloor
              }
            }
          }
        },
        include: {
          marketData: {
            orderBy: { asOf: 'desc' },
            take: 1
          }
        },
        take: 20
      })

      const taxProfile = user.taxProfile as any
      const federalRate = taxProfile?.federalRate || 0.25
      const stateRate = taxProfile?.stateRate || 0.05
      const localRate = taxProfile?.localRate || 0

      const results = bonds
        .map((bond, index) => {
          const marketData = bond.marketData[0]
          if (!marketData) return null

          const atytw = calculateATYTW(
            bond.type,
            marketData.yieldToWorst,
            federalRate,
            stateRate,
            localRate,
            bond.federalTaxExempt,
            bond.stateTaxExempt,
            bond.amt && taxProfile?.amtApplies
          )

          const stabilityScore = calculateStabilityScore(
            bond as any,
            bond.issuer as any,
            marketData as any
          )

          const liquidityScore = calculateLiquidityScore(marketData as any)

          return {
            rank: index + 1,
            bondId: bond.id,
            bond: {
              cusip: bond.cusip,
              issuerName: bond.issuerName,
              type: bond.type,
              coupon: bond.coupon,
              maturity: bond.maturity,
              callable: bond.callable,
              rating: bond.ratingBucket || 'NR',
              price: marketData.price,
              yield: marketData.yield,
              yieldToWorst: marketData.yieldToWorst
            },
            atytw,
            preTaxYtw: marketData.yieldToWorst,
            effectiveTaxRate: federalRate + stateRate + localRate,
            stabilityScore,
            liquidityScore,
            explanation: {
              taxBenefit: bond.federalTaxExempt || bond.stateTaxExempt ? 'Tax-exempt' : 'Taxable',
              stabilityFactors: [`Rating: ${bond.ratingBucket}`, `Stability Score: ${stabilityScore.toFixed(2)}`],
              liquidityFactors: [`Liquidity Score: ${liquidityScore.toFixed(2)}`]
            }
          }
        })
        .filter(Boolean)
        .sort((a, b) => (b?.atytw || 0) - (a?.atytw || 0))

      return NextResponse.json({
        runId: 'live-results',
        ranAt: new Date().toISOString(),
        results
      })
    }

    return NextResponse.json({
      runId: latestRun.id,
      ranAt: latestRun.ranAt,
      results: latestRun.results.map(result => ({
        rank: result.rank,
        bondId: result.bondId,
        bond: {
          cusip: result.bond.cusip,
          issuerName: result.bond.issuerName,
          type: result.bond.type,
          coupon: result.bond.coupon,
          maturity: result.bond.maturity,
          callable: result.bond.callable,
          rating: result.bond.ratingBucket || 'NR',
          price: result.bond.marketData[0]?.price,
          yield: result.bond.marketData[0]?.yield,
          yieldToWorst: result.bond.marketData[0]?.yieldToWorst
        },
        atytw: result.atytw,
        preTaxYtw: result.preTaxYtw,
        effectiveTaxRate: result.effectiveTaxRate,
        stabilityScore: result.stabilityScore,
        liquidityScore: result.liquidityScore,
        explanation: result.explanation
      }))
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}