import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIResearchService } from '@/src/services/aiResearch';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bondIds, query } = await request.json();

    if (!bondIds || !Array.isArray(bondIds)) {
      return NextResponse.json(
        { error: 'Bond IDs array is required' },
        { status: 400 }
      );
    }

    if (process.env.USE_MOCK_FINRA_DATA === 'true') {
      const mockBonds = [
        {
          cusip: '912828YW1',
          issuerName: 'US Treasury',
          couponRate: 4.5,
          maturityDate: '2028-05-15',
          yield: 4.75,
          rating: 'AAA',
          price: 98.5
        },
        {
          cusip: '73358WAA9',
          issuerName: 'Virginia State',
          couponRate: 3.75,
          maturityDate: '2030-07-01',
          yield: 4.25,
          rating: 'AA+',
          price: 96.25
        }
      ];

      const aiService = new AIResearchService();
      const analysis = await aiService.analyzeBonds(
        mockBonds,
        query || 'Provide a comprehensive analysis of these bonds'
      );

      return NextResponse.json({
        success: true,
        analysis,
        bonds: mockBonds
      });
    }

    const bonds = await prisma.bond.findMany({
      where: {
        id: { in: bondIds }
      },
      include: {
        marketData: {
          orderBy: { asOf: 'desc' },
          take: 1
        }
      }
    });

    const bondContext = bonds.map(bond => ({
      cusip: bond.cusip,
      issuerName: bond.issuerName,
      couponRate: bond.coupon,
      maturityDate: bond.maturity.toISOString(),
      yield: bond.marketData[0]?.yield || 0,
      rating: bond.ratingBucket || 'NR',
      price: bond.marketData[0]?.price || 0
    }));

    const aiService = new AIResearchService();
    const analysis = await aiService.analyzeBonds(
      bondContext,
      query || 'Provide a comprehensive analysis of these bonds'
    );

    return NextResponse.json({
      success: true,
      analysis,
      bonds: bondContext
    });
  } catch (error) {
    console.error('Bond analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze bonds' },
      { status: 500 }
    );
  }
}