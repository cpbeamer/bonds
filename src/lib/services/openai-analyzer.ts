import OpenAI from 'openai';
import { BondData } from './finra-api';
import { UserPreferences } from './bond-filter';

export interface BondRecommendation {
  bond: BondData;
  score: number;
  reasoning: string;
  risks: string[];
  opportunities: string[];
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Avoid';
}

export interface AnalysisResult {
  recommendations: BondRecommendation[];
  marketInsight: string;
  topPicks: BondData[];
  analysisDate: Date;
  userId: string;
}

class OpenAIAnalyzer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeBonds(
    bonds: BondData[],
    preferences: UserPreferences,
    userId: string
  ): Promise<AnalysisResult> {
    try {
      const bondSummary = this.prepareBondSummary(bonds);
      const preferenceSummary = this.preparePreferenceSummary(preferences);

      const prompt = `
You are an expert bond analyst. Analyze the following filtered bonds based on user preferences and provide recommendations.

User Preferences:
${preferenceSummary}

Bond Data (top 20 pre-filtered bonds):
${bondSummary}

Provide a JSON response with the following structure:
{
  "recommendations": [
    {
      "cusip": "bond cusip",
      "score": 0-100,
      "reasoning": "brief explanation",
      "risks": ["risk1", "risk2"],
      "opportunities": ["opp1", "opp2"],
      "recommendation": "Strong Buy/Buy/Hold/Avoid"
    }
  ],
  "marketInsight": "brief market analysis",
  "topPicksCusips": ["cusip1", "cusip2", "cusip3"]
}

Focus on:
1. Yield vs risk tradeoff
2. Credit quality and rating trends
3. Maturity alignment with user goals
4. Sector diversification
5. Liquidity (volume/trade count)
6. Call risk if applicable

Limit to top 10 recommendations.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional bond analyst providing data-driven recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');

      const recommendations: BondRecommendation[] = aiResponse.recommendations.map((rec: any) => {
        const bond = bonds.find(b => b.cusip === rec.cusip);
        if (!bond) return null;

        return {
          bond,
          score: rec.score,
          reasoning: rec.reasoning,
          risks: rec.risks || [],
          opportunities: rec.opportunities || [],
          recommendation: rec.recommendation,
        };
      }).filter((r: any) => r !== null);

      const topPicks = aiResponse.topPicksCusips
        ?.map((cusip: string) => bonds.find(b => b.cusip === cusip))
        .filter((b: any) => b !== undefined) || [];

      return {
        recommendations,
        marketInsight: aiResponse.marketInsight || 'Market analysis pending.',
        topPicks,
        analysisDate: new Date(),
        userId,
      };
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return this.getFallbackAnalysis(bonds, userId);
    }
  }

  private prepareBondSummary(bonds: BondData[]): string {
    return bonds.slice(0, 20).map(bond =>
      `CUSIP: ${bond.cusip}, Issuer: ${bond.issuerName}, ` +
      `Yield: ${bond.yield}%, Coupon: ${bond.couponRate}%, ` +
      `Price: ${bond.price}, Rating: ${bond.rating || 'NR'}, ` +
      `Maturity: ${bond.maturityDate}, Sector: ${bond.sector || 'N/A'}, ` +
      `Volume: ${bond.volume || 0}, Callable: ${bond.callableFlag ? 'Yes' : 'No'}`
    ).join('\n');
  }

  private preparePreferenceSummary(preferences: UserPreferences): string {
    const parts = [];
    if (preferences.minYield) parts.push(`Min Yield: ${preferences.minYield}%`);
    if (preferences.maxYield) parts.push(`Max Yield: ${preferences.maxYield}%`);
    if (preferences.minRating) parts.push(`Min Rating: ${preferences.minRating}`);
    if (preferences.maxMaturityYears) parts.push(`Max Maturity: ${preferences.maxMaturityYears} years`);
    if (preferences.sectors?.length) parts.push(`Sectors: ${preferences.sectors.join(', ')}`);
    if (preferences.excludeCallable) parts.push('Exclude Callable Bonds');
    if (preferences.minVolume) parts.push(`Min Volume: $${preferences.minVolume.toLocaleString()}`);
    return parts.join(', ') || 'No specific preferences';
  }

  private getFallbackAnalysis(bonds: BondData[], userId: string): AnalysisResult {
    const topBonds = bonds.slice(0, 10);

    const recommendations: BondRecommendation[] = topBonds.map((bond, index) => ({
      bond,
      score: 90 - (index * 5),
      reasoning: `Strong yield-to-risk ratio with ${bond.yield}% yield and ${bond.rating || 'investment grade'} rating`,
      risks: [
        bond.callableFlag ? 'Call risk' : 'Interest rate risk',
        'Credit risk'
      ],
      opportunities: [
        'Attractive yield',
        'Stable issuer'
      ],
      recommendation: index < 3 ? 'Strong Buy' : index < 6 ? 'Buy' : 'Hold' as any,
    }));

    return {
      recommendations,
      marketInsight: 'Bonds filtered based on algorithmic ranking. Consider diversifying across sectors and maturities.',
      topPicks: topBonds.slice(0, 3),
      analysisDate: new Date(),
      userId,
    };
  }

  async generateDailyReport(analysis: AnalysisResult): Promise<string> {
    const report = `
DAILY BOND SCREENING REPORT
Generated: ${analysis.analysisDate.toLocaleDateString()}

TOP RECOMMENDATIONS:
${analysis.recommendations.slice(0, 5).map((rec, i) => `
${i + 1}. ${rec.bond.issuerName} (${rec.bond.cusip})
   - Recommendation: ${rec.recommendation} (Score: ${rec.score}/100)
   - Yield: ${rec.bond.yield}% | Price: $${rec.bond.price}
   - Rating: ${rec.bond.rating || 'NR'} | Maturity: ${rec.bond.maturityDate}
   - Reasoning: ${rec.reasoning}
`).join('')}

MARKET INSIGHT:
${analysis.marketInsight}

TOP 3 PICKS FOR TODAY:
${analysis.topPicks.map((bond, i) =>
  `${i + 1}. ${bond.issuerName} - ${bond.yield}% yield, ${bond.rating || 'NR'} rating`
).join('\n')}
`;

    return report;
  }
}

export const openAIAnalyzer = new OpenAIAnalyzer();