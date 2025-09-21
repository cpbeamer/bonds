export interface FINRABondData {
  cusip: string;
  symbol?: string;
  issuerName: string;
  bondType: 'CORP' | 'MUNI' | 'AGENCY' | 'TREASURY';
  coupon: number;
  maturityDate: string;
  rating?: {
    moodys?: string;
    sp?: string;
    fitch?: string;
  };
  callable: boolean;
  callDate?: string;
  callPrice?: number;
}

export interface FINRATradeData {
  cusip: string;
  tradeDate: string;
  tradeTime: string;
  price: number;
  yield?: number;
  yieldToWorst?: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  reportingParty: string;
  contraParty?: string;
  settlementDate?: string;
  specialCondition?: string;
  asOfTrade?: boolean;
  whenIssued?: boolean;
}

export interface FINRAMarketData {
  cusip: string;
  asOf: Date;
  lastPrice: number;
  lastYield: number;
  lastTradeDate: Date;
  highPrice?: number;
  lowPrice?: number;
  volumeTraded?: number;
  numberOfTrades?: number;
  averagePrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

export interface FINRAAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface BondSearchCriteria {
  bondType?: 'CORP' | 'MUNI' | 'AGENCY' | 'TREASURY';
  minRating?: string;
  maxMaturity?: number;
  minCoupon?: number;
  maxCoupon?: number;
  minYield?: number;
  callable?: boolean;
  state?: string;
  sector?: string;
}