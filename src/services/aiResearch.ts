import { OpenAI } from 'openai';

interface BondContext {
  cusip?: string;
  issuerName?: string;
  couponRate?: number;
  maturityDate?: string;
  yield?: number;
  rating?: string;
  price?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIResearchService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(
    messages: ChatMessage[],
    bondContext?: BondContext[],
    userId?: string
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(bondContext);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return completion.choices[0].message.content || "I apologize, but I couldn't generate a response.";
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private buildSystemPrompt(bondContext?: BondContext[]): string {
    let prompt = `You are an expert bond market analyst and investment advisor specializing in municipal and corporate bonds.
You provide detailed, accurate, and actionable insights about bond investments, market conditions, and portfolio strategies.

Key capabilities:
- Analyze bond opportunities based on yield, credit quality, and tax implications
- Explain complex bond concepts in clear, accessible language
- Provide market insights and trends
- Assess credit risk and stability factors
- Calculate and explain after-tax yields
- Recommend portfolio strategies based on investor profiles
- Compare different bond types (municipal, corporate, treasury)

Always consider:
- Tax implications for different investor tax brackets
- Current market conditions and interest rate environment
- Credit ratings and issuer financial health
- Liquidity and trading considerations
- Call provisions and other structural features`;

    if (bondContext && bondContext.length > 0) {
      prompt += `\n\nCurrent bond context for analysis:\n`;
      bondContext.forEach((bond, index) => {
        prompt += `\nBond ${index + 1}:
- CUSIP: ${bond.cusip || 'N/A'}
- Issuer: ${bond.issuerName || 'N/A'}
- Coupon: ${bond.couponRate ? bond.couponRate + '%' : 'N/A'}
- Maturity: ${bond.maturityDate || 'N/A'}
- Yield: ${bond.yield ? bond.yield + '%' : 'N/A'}
- Rating: ${bond.rating || 'N/A'}
- Price: ${bond.price ? '$' + bond.price : 'N/A'}`;
      });
      prompt += `\n\nProvide analysis considering these specific bonds when relevant to the user's questions.`;
    }

    return prompt;
  }

  async analyzeBonds(bonds: BondContext[], query: string): Promise<string> {
    try {
      const prompt = `Analyze the following bonds based on this query: "${query}"

Bonds to analyze:
${bonds.map((bond, i) => `
${i + 1}. ${bond.issuerName} (${bond.cusip})
   - Coupon: ${bond.couponRate}%
   - Maturity: ${bond.maturityDate}
   - Yield: ${bond.yield}%
   - Rating: ${bond.rating}
   - Price: $${bond.price}
`).join('')}

Provide:
1. Key observations about these bonds
2. Risk assessment for each
3. Tax implications
4. Recommendation based on the query
5. Any important considerations`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a bond market expert. Provide detailed analysis of bonds with focus on risk, return, and tax efficiency."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      });

      return completion.choices[0].message.content || "Unable to analyze bonds at this time.";
    } catch (error) {
      console.error('Error analyzing bonds:', error);
      throw new Error('Failed to analyze bonds');
    }
  }

  async getMarketInsights(topic: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a senior bond market analyst providing current market insights.
Focus on practical, actionable information for bond investors.
Include relevant data points, trends, and forward-looking considerations.`
          },
          {
            role: "user",
            content: `Provide current insights on: ${topic}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      return completion.choices[0].message.content || "Unable to generate market insights.";
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw new Error('Failed to get market insights');
    }
  }

  async calculateTaxEquivalentYield(
    municipalYield: number,
    federalTaxRate: number,
    stateTaxRate: number = 0
  ): Promise<string> {
    const combinedRate = federalTaxRate + stateTaxRate - (federalTaxRate * stateTaxRate);
    const taxEquivalentYield = municipalYield / (1 - combinedRate);

    return `Tax-Equivalent Yield Analysis:

Municipal Bond Yield: ${municipalYield.toFixed(2)}%
Federal Tax Rate: ${(federalTaxRate * 100).toFixed(1)}%
State Tax Rate: ${(stateTaxRate * 100).toFixed(1)}%
Combined Tax Rate: ${(combinedRate * 100).toFixed(1)}%

**Tax-Equivalent Yield: ${taxEquivalentYield.toFixed(2)}%**

This means a taxable bond would need to yield ${taxEquivalentYield.toFixed(2)}% to provide the same after-tax return as this ${municipalYield.toFixed(2)}% municipal bond.

${taxEquivalentYield > 5 ? '✅ This represents strong value for investors in your tax bracket.' : '⚠️ Consider comparing with current treasury or corporate bond yields.'}`;
  }
}