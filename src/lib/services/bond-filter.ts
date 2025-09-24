import { BondData } from './finra-api';

export interface UserPreferences {
  minYield?: number;
  maxYield?: number;
  minRating?: string;
  maxMaturityYears?: number;
  minPrice?: number;
  maxPrice?: number;
  sectors?: string[];
  excludeCallable?: boolean;
  minVolume?: number;
  minCouponRate?: number;
  maxCouponRate?: number;
}

const ratingScale: { [key: string]: number } = {
  'AAA': 10,
  'AA+': 9,
  'AA': 8,
  'AA-': 7,
  'A+': 6,
  'A': 5,
  'A-': 4,
  'BBB+': 3,
  'BBB': 2,
  'BBB-': 1,
  'BB+': 0,
  'BB': -1,
  'BB-': -2,
  'B+': -3,
  'B': -4,
  'B-': -5,
  'CCC+': -6,
  'CCC': -7,
  'CCC-': -8,
  'CC': -9,
  'C': -10,
  'D': -11,
};

export class BondFilter {
  static filterBonds(bonds: BondData[], preferences: UserPreferences): BondData[] {
    return bonds.filter(bond => {
      if (preferences.minYield && bond.yield < preferences.minYield) {
        return false;
      }

      if (preferences.maxYield && bond.yield > preferences.maxYield) {
        return false;
      }

      if (preferences.minRating && bond.rating) {
        const bondRatingValue = ratingScale[bond.rating] ?? -100;
        const minRatingValue = ratingScale[preferences.minRating] ?? 0;
        if (bondRatingValue < minRatingValue) {
          return false;
        }
      }

      if (preferences.maxMaturityYears) {
        const maturityDate = new Date(bond.maturityDate);
        const today = new Date();
        const yearsToMaturity = (maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (yearsToMaturity > preferences.maxMaturityYears) {
          return false;
        }
      }

      if (preferences.minPrice && bond.price < preferences.minPrice) {
        return false;
      }

      if (preferences.maxPrice && bond.price > preferences.maxPrice) {
        return false;
      }

      if (preferences.sectors && preferences.sectors.length > 0 && bond.sector) {
        if (!preferences.sectors.includes(bond.sector)) {
          return false;
        }
      }

      if (preferences.excludeCallable && bond.callableFlag) {
        return false;
      }

      if (preferences.minVolume && bond.volume && bond.volume < preferences.minVolume) {
        return false;
      }

      if (preferences.minCouponRate && bond.couponRate < preferences.minCouponRate) {
        return false;
      }

      if (preferences.maxCouponRate && bond.couponRate > preferences.maxCouponRate) {
        return false;
      }

      return true;
    });
  }

  static rankBonds(bonds: BondData[]): BondData[] {
    return bonds.sort((a, b) => {
      const scoreA = this.calculateBondScore(a);
      const scoreB = this.calculateBondScore(b);
      return scoreB - scoreA;
    });
  }

  private static calculateBondScore(bond: BondData): number {
    let score = 0;

    score += bond.yield * 10;

    if (bond.rating) {
      const ratingValue = ratingScale[bond.rating] ?? 0;
      score += ratingValue * 5;
    }

    if (bond.volume) {
      score += Math.log10(bond.volume) * 2;
    }

    if (bond.tradeCount) {
      score += Math.log10(bond.tradeCount + 1) * 3;
    }

    const maturityDate = new Date(bond.maturityDate);
    const today = new Date();
    const yearsToMaturity = (maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (yearsToMaturity >= 3 && yearsToMaturity <= 10) {
      score += 5;
    } else if (yearsToMaturity < 3) {
      score += 2;
    }

    if (!bond.callableFlag) {
      score += 3;
    }

    const priceDeviation = Math.abs(100 - bond.price);
    score -= priceDeviation * 0.5;

    return score;
  }

  static getTopBonds(bonds: BondData[], preferences: UserPreferences, limit: number = 20): BondData[] {
    const filtered = this.filterBonds(bonds, preferences);
    const ranked = this.rankBonds(filtered);
    return ranked.slice(0, limit);
  }
}