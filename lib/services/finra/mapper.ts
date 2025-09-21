import { BondType, Prisma } from '@prisma/client';
import { FINRABondData, FINRAMarketData, FINRATradeData } from './types';

export class FINRADataMapper {
  static mapBondType(finraType: string): BondType {
    switch (finraType) {
      case 'CORP':
        return BondType.CORPORATE;
      case 'MUNI':
        return BondType.MUNICIPAL;
      case 'AGENCY':
        return BondType.AGENCY;
      case 'TREASURY':
        return BondType.TREASURY;
      default:
        return BondType.CORPORATE;
    }
  }

  static mapRatingBucket(moodys?: string, sp?: string, fitch?: string): string {
    const ratings = [moodys, sp, fitch].filter(Boolean);
    if (ratings.length === 0) return 'NR';

    const primaryRating = moodys || sp || fitch || 'NR';

    const ratingMap: { [key: string]: string } = {
      'Aaa': 'AAA', 'AAA': 'AAA',
      'Aa1': 'AA+', 'AA+': 'AA+',
      'Aa2': 'AA', 'AA': 'AA',
      'Aa3': 'AA-', 'AA-': 'AA-',
      'A1': 'A+', 'A+': 'A+',
      'A2': 'A', 'A': 'A',
      'A3': 'A-', 'A-': 'A-',
      'Baa1': 'BBB+', 'BBB+': 'BBB+',
      'Baa2': 'BBB', 'BBB': 'BBB',
      'Baa3': 'BBB-', 'BBB-': 'BBB-',
      'Ba1': 'BB+', 'BB+': 'BB+',
      'Ba2': 'BB', 'BB': 'BB',
      'Ba3': 'BB-', 'BB-': 'BB-',
      'B1': 'B+', 'B+': 'B+',
      'B2': 'B', 'B': 'B',
      'B3': 'B-', 'B-': 'B-',
    };

    const mapped = ratingMap[primaryRating];
    if (mapped) return mapped;

    if (primaryRating.startsWith('A')) return 'A';
    if (primaryRating.startsWith('B')) return 'BBB';
    if (primaryRating.startsWith('C')) return 'CCC';

    return 'NR';
  }

  static toBondCreateInput(finraBond: FINRABondData): Prisma.BondCreateInput {
    const maturityDate = new Date(finraBond.maturityDate);
    const isValidDate = !isNaN(maturityDate.getTime());

    return {
      cusip: finraBond.cusip,
      type: this.mapBondType(finraBond.bondType),
      issuerName: finraBond.issuerName,
      coupon: finraBond.coupon,
      maturity: isValidDate ? maturityDate : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      callable: finraBond.callable,
      callSchedule: finraBond.callDate ? {
        callDate: finraBond.callDate,
        callPrice: finraBond.callPrice || 100
      } : undefined,
      moodysRating: finraBond.rating?.moodys,
      spRating: finraBond.rating?.sp,
      fitchRating: finraBond.rating?.fitch,
      ratingBucket: this.mapRatingBucket(
        finraBond.rating?.moodys,
        finraBond.rating?.sp,
        finraBond.rating?.fitch
      ),
      federalTaxExempt: finraBond.bondType === 'MUNI',
      stateTaxExempt: finraBond.bondType === 'MUNI',
      amt: false,
      taxableEquivalent: false,
      bankQualified: false,
      insured: false,
      minDenomination: 5000,
    };
  }

  static toMarketDataCreateInput(
    finraMarketData: FINRAMarketData,
    bondId: string
  ): Prisma.MarketDataCreateInput {
    return {
      bond: { connect: { id: bondId } },
      asOf: finraMarketData.asOf,
      price: finraMarketData.lastPrice,
      ['yield']: finraMarketData.lastYield,
      yieldToWorst: finraMarketData.lastYield,
      duration: this.estimateDuration(finraMarketData.lastYield),
      modifiedDuration: this.estimateModifiedDuration(finraMarketData.lastYield),
      lastTradeDate: finraMarketData.lastTradeDate,
      lastTradePrice: finraMarketData.lastPrice,
      lastTradeYield: finraMarketData.lastYield,
      bidPrice: finraMarketData.lowPrice,
      askPrice: finraMarketData.highPrice,
      volume30d: finraMarketData.volumeTraded,
      tradeCount30d: finraMarketData.numberOfTrades,
    };
  }

  static calculateYieldToWorst(
    trades: FINRATradeData[],
    bond: FINRABondData
  ): number {
    if (trades.length === 0) return 0;

    const latestTrade = trades[0];
    let ytw = latestTrade.yieldToWorst || latestTrade['yield'] || 0;

    if (bond.callable && bond.callDate) {
      const callDate = new Date(bond.callDate);
      const maturityDate = new Date(bond.maturityDate);
      const now = new Date();

      if (callDate > now && callDate < maturityDate) {
        const callPrice = bond.callPrice || 100;
        const price = latestTrade.price;

        if (price > callPrice) {
          const yearsToCall = (callDate.getTime() - now.getTime()) / (365 * 24 * 60 * 60 * 1000);
          const callYield = ((callPrice - price) / price + bond.coupon / 100) / yearsToCall;

          ytw = Math.min(ytw, callYield);
        }
      }
    }

    return ytw;
  }

  static calculateWeightedAveragePrice(trades: FINRATradeData[]): number {
    if (trades.length === 0) return 100;

    const totalValue = trades.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    const totalQuantity = trades.reduce((sum, t) => sum + t.quantity, 0);

    return totalQuantity > 0 ? totalValue / totalQuantity : 100;
  }

  private static estimateDuration(yieldValue: number): number {
    const y = yieldValue / 100;
    return y > 0 ? (1 - Math.exp(-10 * y)) / y : 10;
  }

  private static estimateModifiedDuration(yieldValue: number): number {
    const duration = this.estimateDuration(yieldValue);
    const y = yieldValue / 100;
    return duration / (1 + y);
  }

  static parseCSVDate(dateStr: string): Date {
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{8}$/,
    ];

    if (formats[0].test(dateStr)) {
      return new Date(dateStr);
    }

    if (formats[1].test(dateStr)) {
      const [month, day, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    }

    if (formats[2].test(dateStr)) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return new Date(`${year}-${month}-${day}`);
    }

    return new Date();
  }

  static extractSectorFromIssuer(issuerName: string): string | undefined {
    const sectorKeywords = {
      'BANK': 'Financial',
      'INSURANCE': 'Financial',
      'FINANCE': 'Financial',
      'HEALTH': 'Healthcare',
      'HOSPITAL': 'Healthcare',
      'MEDICAL': 'Healthcare',
      'TECH': 'Technology',
      'SOFTWARE': 'Technology',
      'COMPUTER': 'Technology',
      'ENERGY': 'Energy',
      'OIL': 'Energy',
      'GAS': 'Energy',
      'UTILITY': 'Utilities',
      'POWER': 'Utilities',
      'ELECTRIC': 'Utilities',
      'WATER': 'Utilities',
      'RETAIL': 'Consumer',
      'CONSUMER': 'Consumer',
      'FOOD': 'Consumer',
      'TRANSPORT': 'Transportation',
      'AIRLINE': 'Transportation',
      'RAILROAD': 'Transportation',
      'REAL ESTATE': 'Real Estate',
      'REIT': 'Real Estate',
      'PROPERTY': 'Real Estate',
    };

    const upperName = issuerName.toUpperCase();

    for (const [keyword, sector] of Object.entries(sectorKeywords)) {
      if (upperName.includes(keyword)) {
        return sector;
      }
    }

    return undefined;
  }

  static extractStateFromMuni(issuerName: string, bondType: string): string | undefined {
    if (bondType !== 'MUNI') return undefined;

    const stateAbbreviations = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    const words = issuerName.toUpperCase().split(/\s+/);

    for (const word of words) {
      if (stateAbbreviations.includes(word)) {
        return word;
      }
    }

    const stateNames: { [key: string]: string } = {
      'CALIFORNIA': 'CA', 'TEXAS': 'TX', 'NEW YORK': 'NY', 'FLORIDA': 'FL',
      'ILLINOIS': 'IL', 'PENNSYLVANIA': 'PA', 'OHIO': 'OH', 'GEORGIA': 'GA',
      'NORTH CAROLINA': 'NC', 'MICHIGAN': 'MI'
    };

    for (const [name, abbr] of Object.entries(stateNames)) {
      if (issuerName.toUpperCase().includes(name)) {
        return abbr;
      }
    }

    return undefined;
  }
}