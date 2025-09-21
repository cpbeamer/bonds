import { FINRABondData, FINRATradeData, FINRAMarketData } from './types';

interface MockBondTemplate {
  cusip: string;
  symbol?: string;
  issuerName: string;
  bondType: 'CORP' | 'MUNI' | 'AGENCY' | 'TREASURY';
  coupon: number;
  maturityYears: number;
  rating: { moodys?: string; sp?: string; fitch?: string };
  callable: boolean;
  sector?: string;
  state?: string;
  priceRange: [number, number];
  yieldRange: [number, number];
  volumeRange: [number, number];
  federalExempt?: boolean;
  stateExempt?: boolean;
}

const MOCK_BONDS: MockBondTemplate[] = [
  // Corporate Bonds
  {
    cusip: '037833100',
    symbol: 'AAPL',
    issuerName: 'Apple Inc.',
    bondType: 'CORP',
    coupon: 3.25,
    maturityYears: 5,
    rating: { moodys: 'Aaa', sp: 'AA+', fitch: 'AA+' },
    callable: false,
    sector: 'Technology',
    priceRange: [98, 102],
    yieldRange: [3.1, 3.4],
    volumeRange: [1000000, 5000000],
  },
  {
    cusip: '594918104',
    symbol: 'MSFT',
    issuerName: 'Microsoft Corporation',
    bondType: 'CORP',
    coupon: 2.95,
    maturityYears: 7,
    rating: { moodys: 'Aaa', sp: 'AAA', fitch: 'AAA' },
    callable: false,
    sector: 'Technology',
    priceRange: [97, 101],
    yieldRange: [3.2, 3.5],
    volumeRange: [2000000, 8000000],
  },
  {
    cusip: '023135106',
    symbol: 'AMZN',
    issuerName: 'Amazon.com Inc.',
    bondType: 'CORP',
    coupon: 3.80,
    maturityYears: 10,
    rating: { moodys: 'Aa1', sp: 'AA', fitch: 'AA-' },
    callable: true,
    sector: 'Technology/Retail',
    priceRange: [95, 99],
    yieldRange: [4.0, 4.3],
    volumeRange: [500000, 3000000],
  },
  {
    cusip: '46625H100',
    symbol: 'JPM',
    issuerName: 'JPMorgan Chase & Co.',
    bondType: 'CORP',
    coupon: 4.25,
    maturityYears: 8,
    rating: { moodys: 'A1', sp: 'A-', fitch: 'A' },
    callable: true,
    sector: 'Financial',
    priceRange: [96, 100],
    yieldRange: [4.3, 4.6],
    volumeRange: [1500000, 6000000],
  },
  {
    cusip: '478160104',
    symbol: 'JNJ',
    issuerName: 'Johnson & Johnson',
    bondType: 'CORP',
    coupon: 2.75,
    maturityYears: 6,
    rating: { moodys: 'Aaa', sp: 'AAA', fitch: 'AAA' },
    callable: false,
    sector: 'Healthcare',
    priceRange: [99, 103],
    yieldRange: [2.8, 3.1],
    volumeRange: [800000, 4000000],
  },
  {
    cusip: '30231G102',
    symbol: 'XOM',
    issuerName: 'Exxon Mobil Corporation',
    bondType: 'CORP',
    coupon: 4.50,
    maturityYears: 12,
    rating: { moodys: 'Aa2', sp: 'AA-', fitch: 'AA-' },
    callable: true,
    sector: 'Energy',
    priceRange: [94, 98],
    yieldRange: [4.6, 4.9],
    volumeRange: [600000, 2500000],
  },
  {
    cusip: '931142103',
    symbol: 'WMT',
    issuerName: 'Walmart Inc.',
    bondType: 'CORP',
    coupon: 3.55,
    maturityYears: 9,
    rating: { moodys: 'Aa2', sp: 'AA', fitch: 'AA' },
    callable: false,
    sector: 'Consumer/Retail',
    priceRange: [97, 101],
    yieldRange: [3.6, 3.9],
    volumeRange: [1200000, 5500000],
  },
  {
    cusip: '191216100',
    symbol: 'KO',
    issuerName: 'Coca-Cola Company',
    bondType: 'CORP',
    coupon: 3.00,
    maturityYears: 5,
    rating: { moodys: 'Aa3', sp: 'A+', fitch: 'A+' },
    callable: false,
    sector: 'Consumer',
    priceRange: [98, 102],
    yieldRange: [3.1, 3.4],
    volumeRange: [900000, 3500000],
  },

  // Municipal Bonds
  {
    cusip: 'CA12345678',
    issuerName: 'California State General Obligation',
    bondType: 'MUNI',
    coupon: 4.00,
    maturityYears: 15,
    rating: { moodys: 'Aa2', sp: 'AA-', fitch: 'AA' },
    callable: true,
    state: 'CA',
    priceRange: [95, 100],
    yieldRange: [3.8, 4.2],
    volumeRange: [100000, 500000],
    federalExempt: true,
    stateExempt: true,
  },
  {
    cusip: 'NY23456789',
    issuerName: 'New York City Municipal Water Finance Authority',
    bondType: 'MUNI',
    coupon: 3.75,
    maturityYears: 20,
    rating: { moodys: 'Aa1', sp: 'AA+', fitch: 'AA+' },
    callable: true,
    state: 'NY',
    priceRange: [94, 99],
    yieldRange: [3.9, 4.3],
    volumeRange: [50000, 300000],
    federalExempt: true,
    stateExempt: true,
  },
  {
    cusip: 'TX34567890',
    issuerName: 'Texas Transportation Commission',
    bondType: 'MUNI',
    coupon: 3.50,
    maturityYears: 10,
    rating: { moodys: 'Aaa', sp: 'AAA', fitch: 'AAA' },
    callable: false,
    state: 'TX',
    priceRange: [97, 102],
    yieldRange: [3.4, 3.7],
    volumeRange: [75000, 400000],
    federalExempt: true,
    stateExempt: true,
  },
  {
    cusip: 'FL45678901',
    issuerName: 'Florida Department of Education',
    bondType: 'MUNI',
    coupon: 3.25,
    maturityYears: 12,
    rating: { moodys: 'Aa1', sp: 'AA', fitch: 'AA+' },
    callable: true,
    state: 'FL',
    priceRange: [96, 101],
    yieldRange: [3.3, 3.6],
    volumeRange: [60000, 250000],
    federalExempt: true,
    stateExempt: true,
  },
  {
    cusip: 'IL56789012',
    issuerName: 'Illinois State Toll Highway Authority',
    bondType: 'MUNI',
    coupon: 4.25,
    maturityYears: 18,
    rating: { moodys: 'A3', sp: 'A-', fitch: 'BBB+' },
    callable: true,
    state: 'IL',
    priceRange: [93, 98],
    yieldRange: [4.4, 4.8],
    volumeRange: [40000, 200000],
    federalExempt: true,
    stateExempt: true,
  },
  {
    cusip: 'MA67890123',
    issuerName: 'Massachusetts Water Resources Authority',
    bondType: 'MUNI',
    coupon: 3.00,
    maturityYears: 8,
    rating: { moodys: 'Aa1', sp: 'AA+', fitch: 'AA+' },
    callable: false,
    state: 'MA',
    priceRange: [98, 103],
    yieldRange: [2.9, 3.2],
    volumeRange: [80000, 350000],
    federalExempt: true,
    stateExempt: true,
  },

  // Treasury Bonds
  {
    cusip: '912828ZT8',
    issuerName: 'United States Treasury',
    bondType: 'TREASURY',
    coupon: 2.50,
    maturityYears: 5,
    rating: { moodys: 'Aaa', sp: 'AA+', fitch: 'AAA' },
    callable: false,
    priceRange: [98, 102],
    yieldRange: [2.4, 2.7],
    volumeRange: [10000000, 50000000],
  },
  {
    cusip: '912828ZU5',
    issuerName: 'United States Treasury',
    bondType: 'TREASURY',
    coupon: 2.75,
    maturityYears: 10,
    rating: { moodys: 'Aaa', sp: 'AA+', fitch: 'AAA' },
    callable: false,
    priceRange: [96, 101],
    yieldRange: [2.8, 3.1],
    volumeRange: [15000000, 60000000],
  },
  {
    cusip: '912810SH0',
    issuerName: 'United States Treasury',
    bondType: 'TREASURY',
    coupon: 3.00,
    maturityYears: 30,
    rating: { moodys: 'Aaa', sp: 'AA+', fitch: 'AAA' },
    callable: false,
    priceRange: [85, 95],
    yieldRange: [3.2, 3.5],
    volumeRange: [5000000, 25000000],
  },

  // Agency Bonds
  {
    cusip: '3135G0U43',
    issuerName: 'Federal National Mortgage Association',
    bondType: 'AGENCY',
    coupon: 3.25,
    maturityYears: 7,
    rating: { moodys: 'Aaa', sp: 'AA+', fitch: 'AAA' },
    callable: true,
    sector: 'Government Agency',
    priceRange: [97, 101],
    yieldRange: [3.3, 3.6],
    volumeRange: [500000, 2000000],
  },
  {
    cusip: '3133XLXX9',
    issuerName: 'Federal Home Loan Banks',
    bondType: 'AGENCY',
    coupon: 2.875,
    maturityYears: 5,
    rating: { moodys: 'Aaa', sp: 'AA+', fitch: 'AAA' },
    callable: false,
    sector: 'Government Agency',
    priceRange: [98, 102],
    yieldRange: [2.9, 3.2],
    volumeRange: [600000, 2500000],
  },

  // High Yield Corporate Bonds
  {
    cusip: 'HY1234567',
    symbol: 'TSLA',
    issuerName: 'Tesla Inc.',
    bondType: 'CORP',
    coupon: 5.30,
    maturityYears: 8,
    rating: { moodys: 'Ba3', sp: 'BB', fitch: 'BB+' },
    callable: true,
    sector: 'Technology/Automotive',
    priceRange: [92, 97],
    yieldRange: [5.5, 6.0],
    volumeRange: [300000, 1500000],
  },
  {
    cusip: 'HY2345678',
    issuerName: 'MGM Resorts International',
    bondType: 'CORP',
    coupon: 6.00,
    maturityYears: 10,
    rating: { moodys: 'Ba3', sp: 'BB-', fitch: 'BB' },
    callable: true,
    sector: 'Entertainment',
    priceRange: [90, 95],
    yieldRange: [6.2, 6.8],
    volumeRange: [200000, 800000],
  },
];

export class MockDataGenerator {
  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private static randomInt(min: number, max: number): number {
    return Math.floor(this.randomInRange(min, max + 1));
  }

  private static generateMaturityDate(years: number): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().split('T')[0];
  }

  private static generateCallDate(maturityYears: number): string {
    const callYears = Math.max(2, maturityYears - 3);
    return this.generateMaturityDate(callYears);
  }

  static generateBondData(template: MockBondTemplate): FINRABondData {
    return {
      cusip: template.cusip,
      symbol: template.symbol,
      issuerName: template.issuerName,
      bondType: template.bondType,
      coupon: template.coupon,
      maturityDate: this.generateMaturityDate(template.maturityYears),
      rating: template.rating,
      callable: template.callable,
      callDate: template.callable ? this.generateCallDate(template.maturityYears) : undefined,
      callPrice: template.callable ? this.randomInRange(100, 105) : undefined,
    };
  }

  static generateTradeData(
    cusip: string,
    template: MockBondTemplate,
    daysBack: number = 30
  ): FINRATradeData[] {
    const trades: FINRATradeData[] = [];
    const tradesPerDay = this.randomInt(5, 20);

    for (let day = 0; day < daysBack; day++) {
      const tradeDate = new Date();
      tradeDate.setDate(tradeDate.getDate() - day);

      for (let i = 0; i < tradesPerDay; i++) {
        const price = this.randomInRange(template.priceRange[0], template.priceRange[1]);
        const yieldValue = this.randomInRange(template.yieldRange[0], template.yieldRange[1]);

        trades.push({
          cusip,
          tradeDate: tradeDate.toISOString().split('T')[0],
          tradeTime: `${this.randomInt(9, 16).toString().padStart(2, '0')}:${this.randomInt(0, 59).toString().padStart(2, '0')}:00`,
          price,
          yield: yieldValue,
          yieldToWorst: template.callable ? Math.min(yieldValue, yieldValue * 0.95) : yieldValue,
          quantity: this.randomInRange(template.volumeRange[0], template.volumeRange[1]),
          side: Math.random() > 0.5 ? 'BUY' : 'SELL',
          reportingParty: ['DEALER1', 'DEALER2', 'DEALER3'][this.randomInt(0, 2)],
          settlementDate: new Date(tradeDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }
    }

    return trades.sort((a, b) =>
      new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
    );
  }

  static generateMarketData(cusip: string, template: MockBondTemplate): FINRAMarketData {
    const trades = this.generateTradeData(cusip, template, 1);
    const recentTrades = trades.slice(0, 10);

    const prices = recentTrades.map(t => t.price);
    const yields = recentTrades.map(t => t.yield || 0);

    return {
      cusip,
      asOf: new Date(),
      lastPrice: prices[0] || this.randomInRange(template.priceRange[0], template.priceRange[1]),
      lastYield: yields[0] || this.randomInRange(template.yieldRange[0], template.yieldRange[1]),
      lastTradeDate: new Date(recentTrades[0]?.tradeDate || new Date()),
      highPrice: Math.max(...prices),
      lowPrice: Math.min(...prices),
      volumeTraded: recentTrades.reduce((sum, t) => sum + t.quantity, 0),
      numberOfTrades: recentTrades.length,
      averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      priceChange: this.randomInRange(-2, 2),
      priceChangePercent: this.randomInRange(-2, 2),
    };
  }

  static getAllMockBonds(): FINRABondData[] {
    return MOCK_BONDS.map(template => this.generateBondData(template));
  }

  static getMockBondByType(bondType: 'CORP' | 'MUNI' | 'AGENCY' | 'TREASURY'): FINRABondData[] {
    return MOCK_BONDS
      .filter(template => template.bondType === bondType)
      .map(template => this.generateBondData(template));
  }

  static getMockBondByCusip(cusip: string): FINRABondData | null {
    const template = MOCK_BONDS.find(t => t.cusip === cusip);
    return template ? this.generateBondData(template) : null;
  }

  static getMockTradesByCusip(cusip: string, days: number = 30): FINRATradeData[] {
    const template = MOCK_BONDS.find(t => t.cusip === cusip);
    return template ? this.generateTradeData(cusip, template, days) : [];
  }

  static getMockMarketData(cusips: string[]): FINRAMarketData[] {
    return cusips
      .map(cusip => {
        const template = MOCK_BONDS.find(t => t.cusip === cusip);
        return template ? this.generateMarketData(cusip, template) : null;
      })
      .filter(Boolean) as FINRAMarketData[];
  }

  static searchMockBonds(criteria: {
    bondType?: string;
    minRating?: string;
    maxMaturity?: number;
    state?: string;
  }): FINRABondData[] {
    let filtered = MOCK_BONDS;

    if (criteria.bondType) {
      filtered = filtered.filter(b => b.bondType === criteria.bondType);
    }

    if (criteria.state) {
      filtered = filtered.filter(b => b.state === criteria.state);
    }

    if (criteria.maxMaturity) {
      filtered = filtered.filter(b => b.maturityYears <= criteria.maxMaturity);
    }

    if (criteria.minRating) {
      const ratingOrder = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-'];
      const minIndex = ratingOrder.indexOf(criteria.minRating);

      filtered = filtered.filter(b => {
        const bondRating = b.rating.sp || b.rating.moodys || '';
        const normalizedRating = this.normalizeMoodysRating(bondRating);
        const bondIndex = ratingOrder.indexOf(normalizedRating);
        return bondIndex !== -1 && bondIndex <= minIndex;
      });
    }

    return filtered.map(template => this.generateBondData(template));
  }

  private static normalizeMoodysRating(rating: string): string {
    const moodysToSP: { [key: string]: string } = {
      'Aaa': 'AAA',
      'Aa1': 'AA+', 'Aa2': 'AA', 'Aa3': 'AA-',
      'A1': 'A+', 'A2': 'A', 'A3': 'A-',
      'Baa1': 'BBB+', 'Baa2': 'BBB', 'Baa3': 'BBB-',
      'Ba1': 'BB+', 'Ba2': 'BB', 'Ba3': 'BB-'
    };
    return moodysToSP[rating] || rating;
  }

  static getMockBondTemplates(): MockBondTemplate[] {
    return MOCK_BONDS;
  }
}