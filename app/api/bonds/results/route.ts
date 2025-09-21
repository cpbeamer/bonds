import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { computeATYTW } from '@/lib/calculations/atytw'
import { calculateStabilityScore, calculateLiquidityScore } from '@/lib/calculations/scoring'

// API endpoint for fetching bond results
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if we're in mock data mode
    const useMockData = process.env.USE_MOCK_FINRA_DATA === 'true'

    if (useMockData) {
      // Generate mock bond results for demo
      const mockBonds = [
        {
          rank: 1,
          bondId: 'mock-1',
          bond: {
            cusip: '912828YW1',
            issuerName: 'US Treasury',
            type: 'TREASURY',
            coupon: 4.5,
            maturity: new Date('2028-05-15'),
            callable: false,
            rating: 'AAA',
            price: 98.5,
            yield: 4.75,
            yieldToWorst: 4.75
          },
          atytw: 3.56, // After-tax YTW
          preTaxYtw: 4.75,
          effectiveTaxRate: 0.25,
          stabilityScore: 98,
          liquidityScore: 100,
          explanation: {
            taxBenefit: 'Taxable',
            stabilityFactors: ['Rating: AAA', 'Stability Score: 98.00'],
            liquidityFactors: ['Liquidity Score: 100.00']
          }
        },
        {
          rank: 2,
          bondId: 'mock-2',
          bond: {
            cusip: '73358WAA9',
            issuerName: 'Virginia State',
            type: 'MUNICIPAL',
            coupon: 3.75,
            maturity: new Date('2030-07-01'),
            callable: true,
            rating: 'AA+',
            price: 96.25,
            yield: 4.25,
            yieldToWorst: 4.1
          },
          atytw: 4.1, // Tax-exempt, so same as YTW
          preTaxYtw: 4.1,
          effectiveTaxRate: 0,
          stabilityScore: 92,
          liquidityScore: 85,
          explanation: {
            taxBenefit: 'Tax-exempt',
            stabilityFactors: ['Rating: AA+', 'Stability Score: 92.00'],
            liquidityFactors: ['Liquidity Score: 85.00']
          }
        },
        {
          rank: 3,
          bondId: 'mock-3',
          bond: {
            cusip: '458140BB4',
            issuerName: 'Apple Inc',
            type: 'CORPORATE',
            coupon: 4.85,
            maturity: new Date('2029-02-09'),
            callable: false,
            rating: 'AA+',
            price: 99.75,
            yield: 4.9,
            yieldToWorst: 4.9
          },
          atytw: 3.68,
          preTaxYtw: 4.9,
          effectiveTaxRate: 0.25,
          stabilityScore: 94,
          liquidityScore: 95,
          explanation: {
            taxBenefit: 'Taxable',
            stabilityFactors: ['Rating: AA+', 'Stability Score: 94.00'],
            liquidityFactors: ['Liquidity Score: 95.00']
          }
        }
      ]

      return NextResponse.json({
        runId: 'mock-run-' + Date.now(),
        ranAt: new Date().toISOString(),
        results: mockBonds
      })
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

          const atytw = computeATYTW(
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