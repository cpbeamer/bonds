import axios, { AxiosInstance } from 'axios';
import { FINRABondData, FINRATradeData, FINRAMarketData, FINRAAPIResponse } from './types';
import { MockDataGenerator } from './mock-data';

export class FINRAClient {
  private client: AxiosInstance | null = null;
  private baseURL: string;
  private useMockData: boolean;

  constructor() {
    this.baseURL = process.env.FINRA_API_URL || 'https://api.finra.org/data/group/otcMarket/name';
    this.useMockData = process.env.USE_MOCK_FINRA_DATA === 'true' || process.env.NODE_ENV === 'development';

    if (this.useMockData) {
      console.log('🔧 FINRA Client: Using mock data for development');
    } else {
      this.client = axios.create({
        baseURL: this.baseURL,
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      this.client.interceptors.response.use(
        response => response,
        error => {
          console.error('FINRA API Error:', error.response?.data || error.message);
          throw error;
        }
      );
    }
  }

  async getCorporateBondTrades(cusip: string, startDate?: Date, endDate?: Date): Promise<FINRATradeData[]> {
    try {
      if (this.useMockData) {
        const days = startDate ? Math.ceil((new Date().getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) : 30;
        return MockDataGenerator.getMockTradesByCusip(cusip, days);
      }

      const params: any = {
        cusip,
        limit: 100,
      };

      if (startDate) {
        params.startDate = this.formatDate(startDate);
      }
      if (endDate) {
        params.endDate = this.formatDate(endDate);
      }

      const response = await this.client!.get('/corporateBondTrades', { params });

      return this.parseTradeData(response.data);
    } catch (error) {
      console.error(`Error fetching trades for CUSIP ${cusip}:`, error);
      return [];
    }
  }

  async getBondDetails(cusip: string): Promise<FINRABondData | null> {
    try {
      if (this.useMockData) {
        return MockDataGenerator.getMockBondByCusip(cusip);
      }

      const response = await this.client!.get(`/bondDetails/${cusip}`);
      return this.parseBondData(response.data);
    } catch (error) {
      console.error(`Error fetching bond details for CUSIP ${cusip}:`, error);
      return null;
    }
  }

  async getMarketData(cusips: string[]): Promise<FINRAMarketData[]> {
    try {
      if (this.useMockData) {
        return MockDataGenerator.getMockMarketData(cusips);
      }

      const marketDataPromises = cusips.map(cusip => this.getSingleMarketData(cusip));
      const results = await Promise.allSettled(marketDataPromises);

      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<FINRAMarketData>).value)
        .filter(data => data !== null) as FINRAMarketData[];
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  private async getSingleMarketData(cusip: string): Promise<FINRAMarketData | null> {
    try {
      if (this.useMockData) {
        const mockData = MockDataGenerator.getMockMarketData([cusip]);
        return mockData.length > 0 ? mockData[0] : null;
      }

      const trades = await this.getCorporateBondTrades(cusip);

      if (trades.length === 0) return null;

      const latestTrade = trades[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.tradeDate);
        return tradeDate >= today;
      });

      const prices = todayTrades.map(t => t.price);
      const highPrice = prices.length > 0 ? Math.max(...prices) : undefined;
      const lowPrice = prices.length > 0 ? Math.min(...prices) : undefined;
      const volumeTraded = todayTrades.reduce((sum, t) => sum + t.quantity, 0);
      const averagePrice = prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : latestTrade.price;

      return {
        cusip,
        asOf: new Date(),
        lastPrice: latestTrade.price,
        lastYield: latestTrade.yield || 0,
        lastTradeDate: new Date(latestTrade.tradeDate),
        highPrice,
        lowPrice,
        volumeTraded: volumeTraded > 0 ? volumeTraded : undefined,
        numberOfTrades: todayTrades.length,
        averagePrice,
        priceChange: undefined,
        priceChangePercent: undefined,
      };
    } catch (error) {
      console.error(`Error fetching market data for CUSIP ${cusip}:`, error);
      return null;
    }
  }

  async searchBonds(criteria: {
    bondType?: string;
    minRating?: string;
    maxMaturity?: number;
    state?: string;
  }): Promise<FINRABondData[]> {
    try {
      if (this.useMockData) {
        return MockDataGenerator.searchMockBonds(criteria);
      }

      const params: any = {};

      if (criteria.bondType) params.bondType = criteria.bondType;
      if (criteria.minRating) params.minRating = criteria.minRating;
      if (criteria.maxMaturity) {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + criteria.maxMaturity);
        params.maxMaturityDate = this.formatDate(maxDate);
      }
      if (criteria.state) params.state = criteria.state;

      const response = await this.client!.get('/bondSearch', { params });

      return response.data.map((bond: any) => this.parseBondData(bond)).filter(Boolean);
    } catch (error) {
      console.error('Error searching bonds:', error);
      return [];
    }
  }

  private parseTradeData(data: any[]): FINRATradeData[] {
    if (!Array.isArray(data)) return [];

    return data.map(trade => ({
      cusip: trade.cusip || trade.CUSIP,
      tradeDate: trade.tradeDate || trade.TRADE_DATE,
      tradeTime: trade.tradeTime || trade.TRADE_TIME || '00:00:00',
      price: parseFloat(trade.price || trade.PRICE || 0),
      yield: trade.yield ? parseFloat(trade.yield) : undefined,
      yieldToWorst: trade.yieldToWorst ? parseFloat(trade.yieldToWorst) : undefined,
      quantity: parseFloat(trade.quantity || trade.QUANTITY || 0),
      side: (trade.side || trade.SIDE || 'SELL').toUpperCase() as 'BUY' | 'SELL',
      reportingParty: trade.reportingParty || trade.REPORTING_PARTY || '',
      contraParty: trade.contraParty || trade.CONTRA_PARTY,
      settlementDate: trade.settlementDate || trade.SETTLEMENT_DATE,
      specialCondition: trade.specialCondition || trade.SPECIAL_CONDITION,
      asOfTrade: trade.asOfTrade === 'Y' || trade.AS_OF_TRADE === 'Y',
      whenIssued: trade.whenIssued === 'Y' || trade.WHEN_ISSUED === 'Y',
    }));
  }

  private parseBondData(data: any): FINRABondData | null {
    if (!data) return null;

    return {
      cusip: data.cusip || data.CUSIP,
      symbol: data.symbol || data.SYMBOL,
      issuerName: data.issuerName || data.ISSUER_NAME || '',
      bondType: this.mapBondType(data.bondType || data.BOND_TYPE || 'CORP'),
      coupon: parseFloat(data.coupon || data.COUPON || 0),
      maturityDate: data.maturityDate || data.MATURITY_DATE || '',
      rating: {
        moodys: data.moodysRating || data.MOODYS_RATING,
        sp: data.spRating || data.SP_RATING,
        fitch: data.fitchRating || data.FITCH_RATING,
      },
      callable: data.callable === 'Y' || data.CALLABLE === 'Y' || false,
      callDate: data.callDate || data.CALL_DATE,
      callPrice: data.callPrice ? parseFloat(data.callPrice) : undefined,
    };
  }

  private mapBondType(type: string): 'CORP' | 'MUNI' | 'AGENCY' | 'TREASURY' {
    const upperType = type.toUpperCase();
    switch (upperType) {
      case 'CORPORATE':
      case 'CORP':
        return 'CORP';
      case 'MUNICIPAL':
      case 'MUNI':
        return 'MUNI';
      case 'AGENCY':
      case 'GSE':
        return 'AGENCY';
      case 'TREASURY':
      case 'UST':
        return 'TREASURY';
      default:
        return 'CORP';
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}