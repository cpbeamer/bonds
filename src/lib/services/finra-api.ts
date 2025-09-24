import { z } from 'zod';

const BondDataSchema = z.object({
  cusip: z.string(),
  symbol: z.string().optional(),
  issuerName: z.string(),
  maturityDate: z.string(),
  couponRate: z.number(),
  price: z.number(),
  yield: z.number(),
  rating: z.string().optional(),
  volume: z.number().optional(),
  lastTradeDate: z.string().optional(),
  callableFlag: z.boolean().optional(),
  sector: z.string().optional(),
  tradeCount: z.number().optional(),
});

export type BondData = z.infer<typeof BondDataSchema>;

interface FINRAConfig {
  clientId: string;
  apiUrl: string;
}

class FINRAService {
  private config: FINRAConfig;

  constructor() {
    this.config = {
      clientId: process.env.FINRA_CLIENT_ID || '',
      apiUrl: process.env.FINRA_API_URL || 'https://api.finra.org/data/group/otcMarket/name',
    };
  }

  async fetchCorporateBonds(): Promise<BondData[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/corporateBonds`, {
        headers: {
          'Client-Id': this.config.clientId,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`FINRA API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseBondData(data);
    } catch (error) {
      console.error('Error fetching FINRA data:', error);
      if (process.env.USE_MOCK_FINRA_DATA === 'true') {
        return this.getMockData();
      }
      throw error;
    }
  }

  async fetchMunicipalBonds(): Promise<BondData[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/municipalBonds`, {
        headers: {
          'Client-Id': this.config.clientId,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`FINRA API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseBondData(data);
    } catch (error) {
      console.error('Error fetching municipal bonds:', error);
      if (process.env.USE_MOCK_FINRA_DATA === 'true') {
        return this.getMockMunicipalData();
      }
      throw error;
    }
  }

  async fetchAllBonds(): Promise<BondData[]> {
    const [corporateBonds, municipalBonds] = await Promise.all([
      this.fetchCorporateBonds(),
      this.fetchMunicipalBonds(),
    ]);

    return [...corporateBonds, ...municipalBonds];
  }

  private parseBondData(rawData: any): BondData[] {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData
      .map((item) => {
        try {
          return BondDataSchema.parse({
            cusip: item.cusip || item.CUSIP,
            symbol: item.symbol || item.SYMBOL,
            issuerName: item.issuerName || item.issuer_name || item.ISSUER_NAME,
            maturityDate: item.maturityDate || item.maturity_date || item.MATURITY_DATE,
            couponRate: parseFloat(item.couponRate || item.coupon_rate || item.COUPON_RATE || 0),
            price: parseFloat(item.price || item.PRICE || 100),
            yield: parseFloat(item.yield || item.YIELD || item.ytm || 0),
            rating: item.rating || item.RATING || item.moodysRating || item.spRating,
            volume: parseFloat(item.volume || item.VOLUME || 0),
            lastTradeDate: item.lastTradeDate || item.last_trade_date,
            callableFlag: item.callableFlag || item.callable === 'Y',
            sector: item.sector || item.SECTOR,
            tradeCount: parseInt(item.tradeCount || item.trade_count || 0),
          });
        } catch (error) {
          console.warn('Failed to parse bond data:', item, error);
          return null;
        }
      })
      .filter((bond): bond is BondData => bond !== null);
  }

  private getMockData(): BondData[] {
    return [
      {
        cusip: '037833100',
        symbol: 'AAPL',
        issuerName: 'Apple Inc',
        maturityDate: '2027-05-11',
        couponRate: 3.25,
        price: 98.5,
        yield: 3.45,
        rating: 'AA+',
        volume: 5000000,
        lastTradeDate: '2024-01-15',
        callableFlag: false,
        sector: 'Technology',
        tradeCount: 150,
      },
      {
        cusip: '594918104',
        symbol: 'MSFT',
        issuerName: 'Microsoft Corporation',
        maturityDate: '2029-02-06',
        couponRate: 3.50,
        price: 99.25,
        yield: 3.58,
        rating: 'AAA',
        volume: 8000000,
        lastTradeDate: '2024-01-15',
        callableFlag: false,
        sector: 'Technology',
        tradeCount: 200,
      },
      {
        cusip: '459200101',
        symbol: 'IBM',
        issuerName: 'IBM Corporation',
        maturityDate: '2026-11-30',
        couponRate: 4.00,
        price: 101.5,
        yield: 3.75,
        rating: 'A',
        volume: 3000000,
        lastTradeDate: '2024-01-14',
        callableFlag: true,
        sector: 'Technology',
        tradeCount: 100,
      },
      {
        cusip: '172967424',
        symbol: 'C',
        issuerName: 'Citigroup Inc',
        maturityDate: '2028-07-30',
        couponRate: 4.45,
        price: 97.75,
        yield: 4.78,
        rating: 'BBB+',
        volume: 6000000,
        lastTradeDate: '2024-01-15',
        callableFlag: true,
        sector: 'Financial',
        tradeCount: 175,
      },
      {
        cusip: '46625H100',
        symbol: 'JPM',
        issuerName: 'JPMorgan Chase & Co',
        maturityDate: '2030-03-15',
        couponRate: 3.875,
        price: 96.50,
        yield: 4.25,
        rating: 'A-',
        volume: 10000000,
        lastTradeDate: '2024-01-15',
        callableFlag: false,
        sector: 'Financial',
        tradeCount: 250,
      },
    ];
  }

  private getMockMunicipalData(): BondData[] {
    return [
      {
        cusip: '64966HAN5',
        issuerName: 'New York City Municipal',
        maturityDate: '2035-08-15',
        couponRate: 4.00,
        price: 102.25,
        yield: 3.85,
        rating: 'AA',
        volume: 2000000,
        lastTradeDate: '2024-01-15',
        callableFlag: true,
        sector: 'Municipal',
        tradeCount: 50,
      },
      {
        cusip: '13063A5G5',
        issuerName: 'California State',
        maturityDate: '2032-04-01',
        couponRate: 3.75,
        price: 99.50,
        yield: 3.80,
        rating: 'AA-',
        volume: 3000000,
        lastTradeDate: '2024-01-14',
        callableFlag: false,
        sector: 'Municipal',
        tradeCount: 75,
      },
    ];
  }
}

export const finraService = new FINRAService();