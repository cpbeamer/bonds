import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIResearchService } from '@/src/services/aiResearch';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, bondContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const aiService = new AIResearchService();
    const response = await aiService.generateResponse(messages, bondContext, userId);

    return NextResponse.json({
      success: true,
      message: response
    });
  } catch (error) {
    console.error('AI Research API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const aiService = new AIResearchService();

    if (action === 'market-insights') {
      const topic = searchParams.get('topic') || 'general bond market conditions';
      const insights = await aiService.getMarketInsights(topic);

      return NextResponse.json({
        success: true,
        insights
      });
    }

    if (action === 'tax-equivalent-yield') {
      const municipalYield = parseFloat(searchParams.get('yield') || '0');
      const federalRate = parseFloat(searchParams.get('federal') || '0.25');
      const stateRate = parseFloat(searchParams.get('state') || '0');

      const analysis = await aiService.calculateTaxEquivalentYield(
        municipalYield,
        federalRate,
        stateRate
      );

      return NextResponse.json({
        success: true,
        analysis
      });
    }

    return NextResponse.json({
      success: true,
      message: 'AI Research endpoint is ready'
    });
  } catch (error) {
    console.error('AI Research GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}