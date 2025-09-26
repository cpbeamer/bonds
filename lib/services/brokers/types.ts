export interface BrokerAccount {
  id: string
  brokerId: string
  accountNumber: string
  accountType: 'INDIVIDUAL' | 'IRA' | 'ROTH_IRA' | 'JOINT' | 'TRUST'
  accountName: string
  cashBalance: number
  totalValue: number
  lastSync: Date
}

export interface BrokerPosition {
  id: string
  accountId: string
  symbol: string
  cusip?: string
  description: string
  quantity: number
  marketValue: number
  costBasis: number
  unrealizedGainLoss: number
  currentPrice: number
  assetType: 'BOND' | 'STOCK' | 'ETF' | 'MUTUAL_FUND' | 'CASH'
  maturityDate?: Date
  couponRate?: number
  yieldToMaturity?: number
}

export interface BrokerTransaction {
  id: string
  accountId: string
  transactionDate: Date
  settlementDate: Date
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'FEE'
  symbol?: string
  cusip?: string
  description: string
  quantity?: number
  price?: number
  amount: number
  fees: number
}

export interface BrokerIntegration {
  connect(): Promise<void>
  disconnect(): Promise<void>
  getAccounts(): Promise<BrokerAccount[]>
  getPositions(accountId: string): Promise<BrokerPosition[]>
  getTransactions(accountId: string, startDate?: Date, endDate?: Date): Promise<BrokerTransaction[]>
  placeTrade(trade: TradeOrder): Promise<TradeConfirmation>
}

export interface TradeOrder {
  accountId: string
  symbol: string
  cusip?: string
  side: 'BUY' | 'SELL'
  quantity: number
  orderType: 'MARKET' | 'LIMIT' | 'STOP'
  limitPrice?: number
  timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK'
}

export interface TradeConfirmation {
  orderId: string
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED'
  filledQuantity?: number
  executionPrice?: number
  timestamp: Date
  message?: string
}

export interface PortfolioGap {
  category: string
  currentAllocation: number
  targetAllocation: number
  gap: number
  recommendations: GapRecommendation[]
}

export interface GapRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD'
  security: {
    cusip: string
    name: string
    type: string
    yield?: number
    rating?: string
  }
  quantity: number
  rationale: string
  impact: {
    allocationChange: number
    yieldChange: number
    riskChange: number
  }
}
