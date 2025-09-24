import { OpenAI } from 'openai';

interface BondData {
  cusip: string;
  issuerName: string;
  couponRate: number;
  maturityDate: string;
  price: number;
  yield: number;
  rating: string;
  volume: number;
  lastTradeDate: string;
}

interface UserPreferences {
  minYield?: number;
  maxYield?: number;
  minRating?: string;
  maxMaturityYears?: number;
  minVolume?: number;
  sectors?: string[];
  excludeCallable?: boolean;
}

interface ScreeningResult {
  bonds: BondData[];
  aiAnalysis: string;
  timestamp: Date;
}

export class BondScreeningService {
  private openai: OpenAI;
  private finraApiUrl: string;
  private finraClientId: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.finraApiUrl = process.env.FINRA_API_URL || '';
    this.finraClientId = process.env.FINRA_CLIENT_ID || '';
  }

  async fetchBondData(): Promise<BondData[]> {
    try {
      if (process.env.USE_MOCK_FINRA_DATA === 'true') {
        return this.getMockBondData();
      }

      const response = await fetch(`${this.finraApiUrl}/bonds`, {
        headers: {
          'Client-ID': this.finraClientId,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`FINRA API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformFINRAData(data);
    } catch (error) {
      console.error('Error fetching bond data:', error);
      throw error;
    }
  }

  private transformFINRAData(rawData: any): BondData[] {
    return rawData.map((bond: any) => ({
      cusip: bond.cusip,
      issuerName: bond.issuerName,
      couponRate: parseFloat(bond.couponRate),
      maturityDate: bond.maturityDate,
      price: parseFloat(bond.price),
      yield: parseFloat(bond.yield),
      rating: bond.rating,
      volume: parseInt(bond.volume),
      lastTradeDate: bond.lastTradeDate,
    }));
  }

  filterBonds(bonds: BondData[], preferences: UserPreferences): BondData[] {
    return bonds.filter(bond => {
      if (preferences.minYield && bond.yield < preferences.minYield) return false;
      if (preferences.maxYield && bond.yield > preferences.maxYield) return false;

      if (preferences.minRating && !this.meetsRatingCriteria(bond.rating, preferences.minRating)) {
        return false;
      }

      if (preferences.maxMaturityYears) {
        const maturityDate = new Date(bond.maturityDate);
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + preferences.maxMaturityYears);
        if (maturityDate > maxDate) return false;
      }

      if (preferences.minVolume && bond.volume < preferences.minVolume) return false;

      return true;
    });
  }

  private meetsRatingCriteria(bondRating: string, minRating: string): boolean {
    const ratingOrder = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-'];
    const bondIndex = ratingOrder.indexOf(bondRating);
    const minIndex = ratingOrder.indexOf(minRating);

    if (bondIndex === -1 || minIndex === -1) return false;
    return bondIndex <= minIndex;
  }

  async analyzeWithAI(bonds: BondData[], preferences: UserPreferences): Promise<string> {
    try {
      const prompt = this.constructAIPrompt(bonds, preferences);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a bond market analyst. Provide concise, actionable insights on bond opportunities."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content || "No analysis available.";
    } catch (error) {
      console.error('Error in AI analysis:', error);
      return "AI analysis temporarily unavailable.";
    }
  }

  private constructAIPrompt(bonds: BondData[], preferences: UserPreferences): string {
    const bondSummary = bonds.slice(0, 10).map(bond =>
      `${bond.issuerName}: ${bond.yield}% yield, ${bond.rating} rating, matures ${bond.maturityDate}`
    ).join('\n');

    return `Analyze these bond opportunities based on user preferences:

User Preferences:
- Target Yield: ${preferences.minYield || 'Any'} - ${preferences.maxYield || 'Any'}%
- Minimum Rating: ${preferences.minRating || 'Any'}
- Max Maturity: ${preferences.maxMaturityYears || 'Any'} years

Top Bonds Found:
${bondSummary}

Provide:
1. Best opportunities and why
2. Risk considerations
3. Market context
4. Recommendations`;
  }

  async performDailyScreening(userId: string, preferences: UserPreferences): Promise<ScreeningResult> {
    try {
      const allBonds = await this.fetchBondData();

      const filteredBonds = this.filterBonds(allBonds, preferences);

      const aiAnalysis = await this.analyzeWithAI(filteredBonds, preferences);

      const result: ScreeningResult = {
        bonds: filteredBonds.slice(0, 20),
        aiAnalysis,
        timestamp: new Date()
      };

      await this.saveScreeningResult(userId, result);

      return result;
    } catch (error) {
      console.error('Error in daily screening:', error);
      throw error;
    }
  }

  private async saveScreeningResult(userId: string, result: ScreeningResult): Promise<void> {
    console.log(`Saving screening result for user ${userId}`, {
      bondCount: result.bonds.length,
      timestamp: result.timestamp
    });
  }

  private getMockBondData(): BondData[] {
    return [
      {
        cusip: "912828Z70",
        issuerName: "US Treasury",
        couponRate: 4.5,
        maturityDate: "2027-11-15",
        price: 98.5,
        yield: 4.75,
        rating: "AAA",
        volume: 1000000,
        lastTradeDate: "2024-01-15"
      },
      {
        cusip: "037833AK6",
        issuerName: "Apple Inc",
        couponRate: 3.85,
        maturityDate: "2029-05-04",
        price: 97.2,
        yield: 4.2,
        rating: "AA+",
        volume: 500000,
        lastTradeDate: "2024-01-15"
      },
      {
        cusip: "594918BP8",
        issuerName: "Microsoft Corp",
        couponRate: 3.5,
        maturityDate: "2028-02-12",
        price: 96.8,
        yield: 4.1,
        rating: "AAA",
        volume: 750000,
        lastTradeDate: "2024-01-15"
      }
    ];
  }
}