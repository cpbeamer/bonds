import { 
  BrokerAccount, 
  BrokerPosition, 
  BrokerTransaction, 
  BrokerIntegration,
  TradeOrder,
  TradeConfirmation
} from '../types'

interface FidelityConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  apiBaseUrl: string
}

export class FidelityClient implements BrokerIntegration {
  private config: FidelityConfig
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(config: Partial<FidelityConfig> = {}) {
    this.config = {
      clientId: config.clientId || process.env.FIDELITY_CLIENT_ID || '',
      clientSecret: config.clientSecret || process.env.FIDELITY_CLIENT_SECRET || '',
      redirectUri: config.redirectUri || process.env.FIDELITY_REDIRECT_URI || '',
      apiBaseUrl: config.apiBaseUrl || 'https://api.fidelity.com/v1',
    }
  }

  /**
   * OAuth2 Authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'accounts positions trades',
      state,
    })

    return `https://login.fidelity.com/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<void> {
    const response = await fetch('https://login.fidelity.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token
  }

  /**
   * Set access token directly (for server-side use)
   */
  setAccessToken(token: string): void {
    this.accessToken = token
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async connect(): Promise<void> {
    // Connection is handled via OAuth flow
    if (!this.accessToken) {
      throw new Error('Must complete OAuth flow first')
    }
  }

  async disconnect(): Promise<void> {
    this.accessToken = null
    this.refreshToken = null
  }

  async getAccounts(): Promise<BrokerAccount[]> {
    const response = await this.apiRequest<any>('/accounts')
    
    return response.accounts.map((account: any) => ({
      id: account.accountId,
      brokerId: 'fidelity',
      accountNumber: account.accountNumber,
      accountType: this.mapAccountType(account.accountType),
      accountName: account.accountName,
      cashBalance: account.cashBalance,
      totalValue: account.totalValue,
      lastSync: new Date(),
    }))
  }

  async getPositions(accountId: string): Promise<BrokerPosition[]> {
    const response = await this.apiRequest<any>(`/accounts/${accountId}/positions`)
    
    return response.positions
      .filter((position: any) => position.quantity > 0)
      .map((position: any) => ({
        id: `${accountId}_${position.symbol}`,
        accountId,
        symbol: position.symbol,
        cusip: position.cusip,
        description: position.description,
        quantity: position.quantity,
        marketValue: position.marketValue,
        costBasis: position.costBasis || position.quantity * position.averagePrice,
        unrealizedGainLoss: position.marketValue - (position.costBasis || position.quantity * position.averagePrice),
        currentPrice: position.lastPrice,
        assetType: this.mapAssetType(position.assetType),
        maturityDate: position.maturityDate ? new Date(position.maturityDate) : undefined,
        couponRate: position.couponRate,
        yieldToMaturity: position.yieldToMaturity,
      }))
  }

  async getTransactions(
    accountId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<BrokerTransaction[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate.toISOString().split('T')[0])
    if (endDate) params.append('endDate', endDate.toISOString().split('T')[0])
    
    const response = await this.apiRequest<any>(
      `/accounts/${accountId}/transactions?${params.toString()}`
    )
    
    return response.transactions.map((transaction: any) => ({
      id: transaction.transactionId,
      accountId,
      transactionDate: new Date(transaction.transactionDate),
      settlementDate: new Date(transaction.settlementDate),
      type: this.mapTransactionType(transaction.transactionType),
      symbol: transaction.symbol,
      cusip: transaction.cusip,
      description: transaction.description,
      quantity: transaction.quantity,
      price: transaction.price,
      amount: transaction.amount,
      fees: transaction.fees || 0,
    }))
  }

  async placeTrade(trade: TradeOrder): Promise<TradeConfirmation> {
    const orderPayload = {
      accountId: trade.accountId,
      symbol: trade.symbol,
      cusip: trade.cusip,
      side: trade.side,
      quantity: trade.quantity,
      orderType: trade.orderType,
      limitPrice: trade.limitPrice,
      timeInForce: trade.timeInForce,
    }

    const response = await this.apiRequest<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    })

    return {
      orderId: response.orderId,
      status: response.status,
      filledQuantity: response.filledQuantity,
      executionPrice: response.executionPrice,
      timestamp: new Date(response.timestamp),
      message: response.message,
    }
  }

  /**
   * Get real-time quotes for bonds
   */
  async getBondQuotes(cusips: string[]): Promise<any> {
    const response = await this.apiRequest<any>('/quotes', {
      method: 'POST',
      body: JSON.stringify({ cusips }),
    })

    return response.quotes
  }

  private mapAccountType(fidelityType: string): BrokerAccount['accountType'] {
    const mapping: Record<string, BrokerAccount['accountType']> = {
      'INDIVIDUAL': 'INDIVIDUAL',
      'IRA': 'IRA',
      'ROTH_IRA': 'ROTH_IRA',
      'JOINT': 'JOINT',
      'TRUST': 'TRUST',
    }
    return mapping[fidelityType] || 'INDIVIDUAL'
  }

  private mapAssetType(fidelityType: string): BrokerPosition['assetType'] {
    const mapping: Record<string, BrokerPosition['assetType']> = {
      'BOND': 'BOND',
      'EQUITY': 'STOCK',
      'ETF': 'ETF',
      'MUTUAL_FUND': 'MUTUAL_FUND',
      'CASH': 'CASH',
    }
    return mapping[fidelityType] || 'BOND'
  }

  private mapTransactionType(fidelityType: string): BrokerTransaction['type'] {
    const mapping: Record<string, BrokerTransaction['type']> = {
      'BUY': 'BUY',
      'SELL': 'SELL',
      'DIVIDEND': 'DIVIDEND',
      'INTEREST': 'INTEREST',
      'FEE': 'FEE',
    }
    return mapping[fidelityType] || 'BUY'
  }
}
