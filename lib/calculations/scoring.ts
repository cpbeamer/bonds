import { Bond, Issuer, MarketData, IssuerType } from '@prisma/client';

interface BondWithRelations extends Bond {
  issuer: Issuer | null;
  marketData: MarketData[];
}

const SECTOR_SCORES: Record<string, number> = {
  'water-sewer': 0.95,
  'utilities': 0.90,
  'airports': 0.85,
  'toll-roads': 0.85,
  'public-power': 0.85,
  'essential-service': 0.80,
  'general-obligation': 0.80,
  'school-district': 0.75,
  'higher-education': 0.70,
  'transportation': 0.70,
  'housing': 0.65,
  'healthcare': 0.60,
  'hospitals': 0.55,
  'student-housing': 0.50,
  'nursing-homes': 0.45,
  'industrial-development': 0.40,
};

const STATE_QUALITY_SCORES: Record<string, number> = {
  'VA': 0.85,
  'MD': 0.85,
  'MA': 0.85,
  'TX': 0.80,
  'FL': 0.75,
  'CA': 0.70,
  'NY': 0.75,
  'NC': 0.80,
  'GA': 0.75,
  'WA': 0.80,
  'CO': 0.80,
  'UT': 0.85,
  'IL': 0.60,
  'NJ': 0.65,
  'CT': 0.65,
  'PA': 0.70,
};

const RATING_SCORES: Record<string, number> = {
  'AAA': 1.00,
  'AA+': 0.95,
  'AA': 0.90,
  'AA-': 0.85,
  'A+': 0.80,
  'A': 0.75,
  'A-': 0.70,
  'BBB+': 0.65,
  'BBB': 0.60,
  'BBB-': 0.55,
};

export function calculateStabilityScore(bond: BondWithRelations): {
  score: number;
  factors: string[];
} {
  let score = 0.5;
  const factors: string[] = [];

  if (bond.issuer?.type === 'MUNICIPALITY' || bond.issuer?.type === 'COUNTY') {
    score += 0.15;
    factors.push(`GO ${bond.issuer.type.toLowerCase()}`);
  } else if (bond.sector) {
    const sectorScore = SECTOR_SCORES[bond.sector.toLowerCase()] || 0.5;
    score = score * 0.3 + sectorScore * 0.7;
    factors.push(`Sector: ${bond.sector}`);
  }

  if (bond.state) {
    const stateScore = STATE_QUALITY_SCORES[bond.state] || 0.7;
    score = score * 0.8 + stateScore * 0.2;
    factors.push(`State: ${bond.state}`);
  }

  if (bond.ratingBucket) {
    const ratingScore = RATING_SCORES[bond.ratingBucket] || 0.6;
    score = score * 0.6 + ratingScore * 0.4;
    factors.push(`Rating: ${bond.ratingBucket}`);
  }

  if (bond.insured) {
    score += 0.05;
    factors.push(`Insured by ${bond.insurer || 'unknown'}`);
  }

  if (bond.underlyingRating) {
    const underlyingScore = RATING_SCORES[bond.underlyingRating] || 0.6;
    if (underlyingScore > 0.7) {
      score += 0.03;
      factors.push(`Strong underlying: ${bond.underlyingRating}`);
    }
  }

  score = Math.min(Math.max(score, 0), 1);

  return { score, factors };
}

export function calculateLiquidityScore(
  bond: BondWithRelations,
  latestMarketData?: MarketData
): {
  score: number;
  factors: string[];
} {
  let score = 0.5;
  const factors: string[] = [];

  if (latestMarketData?.lastTradeDate) {
    const daysSinceLastTrade = Math.floor(
      (Date.now() - latestMarketData.lastTradeDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastTrade <= 1) {
      score += 0.25;
      factors.push('Traded today/yesterday');
    } else if (daysSinceLastTrade <= 7) {
      score += 0.15;
      factors.push(`Last trade ${daysSinceLastTrade}d ago`);
    } else if (daysSinceLastTrade <= 30) {
      score += 0.05;
      factors.push(`Last trade ${daysSinceLastTrade}d ago`);
    } else {
      score -= 0.1;
      factors.push(`Stale: ${daysSinceLastTrade}d since trade`);
    }
  }

  if (latestMarketData?.tradeCount30d) {
    if (latestMarketData.tradeCount30d >= 20) {
      score += 0.2;
      factors.push(`Active: ${latestMarketData.tradeCount30d} trades/30d`);
    } else if (latestMarketData.tradeCount30d >= 10) {
      score += 0.1;
      factors.push(`Moderate: ${latestMarketData.tradeCount30d} trades/30d`);
    } else if (latestMarketData.tradeCount30d >= 5) {
      score += 0.05;
      factors.push(`Light: ${latestMarketData.tradeCount30d} trades/30d`);
    }
  }

  if (latestMarketData?.bidPrice && latestMarketData?.askPrice) {
    const spread = latestMarketData.askPrice - latestMarketData.bidPrice;
    const midPrice = (latestMarketData.askPrice + latestMarketData.bidPrice) / 2;
    const spreadPercent = (spread / midPrice) * 100;

    if (spreadPercent < 0.5) {
      score += 0.15;
      factors.push(`Tight spread: ${spreadPercent.toFixed(2)}%`);
    } else if (spreadPercent < 1.0) {
      score += 0.05;
      factors.push(`Normal spread: ${spreadPercent.toFixed(2)}%`);
    } else {
      score -= 0.05;
      factors.push(`Wide spread: ${spreadPercent.toFixed(2)}%`);
    }
  }

  if (bond.minDenomination <= 5000) {
    score += 0.05;
    factors.push('$5k minimum');
  } else if (bond.minDenomination >= 25000) {
    score -= 0.05;
    factors.push(`High minimum: $${(bond.minDenomination / 1000).toFixed(0)}k`);
  }

  if (latestMarketData?.volume30d && latestMarketData.volume30d > 1000000) {
    score += 0.1;
    factors.push(`High volume: $${(latestMarketData.volume30d / 1000000).toFixed(1)}M/30d`);
  }

  score = Math.min(Math.max(score, 0), 1);

  return { score, factors };
}

export interface RankedBond {
  bond: BondWithRelations;
  atytw: number;
  preTaxYtw: number;
  stabilityScore: number;
  liquidityScore: number;
  rank?: number;
  explanation: any;
}

export function rankBonds(
  candidates: RankedBond[],
  maxDuration?: number
): RankedBond[] {
  let filtered = [...candidates];

  if (maxDuration) {
    filtered = filtered.filter(c => {
      const latestData = c.bond.marketData[0];
      return !latestData?.duration || latestData.duration <= maxDuration;
    });
  }

  const sorted = filtered.sort((a, b) => {
    if (Math.abs(a.atytw - b.atytw) > 0.001) {
      return b.atytw - a.atytw;
    }

    if (Math.abs(a.liquidityScore - b.liquidityScore) > 0.05) {
      return b.liquidityScore - a.liquidityScore;
    }

    if (Math.abs(a.stabilityScore - b.stabilityScore) > 0.05) {
      return b.stabilityScore - a.stabilityScore;
    }

    const aDuration = a.bond.marketData[0]?.duration || 10;
    const bDuration = b.bond.marketData[0]?.duration || 10;
    return aDuration - bDuration;
  });

  return sorted.map((bond, index) => ({
    ...bond,
    rank: index + 1,
  }));
}

export function explainRank(rankedBond: RankedBond): {
  summary: string;
  bullets: string[];
  math: any;
} {
  const bullets: string[] = [];

  bullets.push(`After-tax YTW: ${(rankedBond.atytw * 100).toFixed(2)}%`);
  bullets.push(`Pre-tax YTW: ${(rankedBond.preTaxYtw * 100).toFixed(2)}%`);

  if (rankedBond.stabilityScore >= 0.8) {
    bullets.push(`High stability: ${(rankedBond.stabilityScore * 100).toFixed(0)}/100`);
  } else if (rankedBond.stabilityScore >= 0.6) {
    bullets.push(`Moderate stability: ${(rankedBond.stabilityScore * 100).toFixed(0)}/100`);
  } else {
    bullets.push(`Lower stability: ${(rankedBond.stabilityScore * 100).toFixed(0)}/100`);
  }

  if (rankedBond.liquidityScore >= 0.7) {
    bullets.push(`Good liquidity: ${(rankedBond.liquidityScore * 100).toFixed(0)}/100`);
  } else if (rankedBond.liquidityScore >= 0.5) {
    bullets.push(`Fair liquidity: ${(rankedBond.liquidityScore * 100).toFixed(0)}/100`);
  } else {
    bullets.push(`Limited liquidity: ${(rankedBond.liquidityScore * 100).toFixed(0)}/100`);
  }

  const latestData = rankedBond.bond.marketData[0];
  if (latestData?.lastTradeDate) {
    const daysSince = Math.floor(
      (Date.now() - latestData.lastTradeDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    bullets.push(`Last traded ${daysSince === 0 ? 'today' : `${daysSince}d ago`}`);
  }

  const summary = `Rank #${rankedBond.rank || 'N/A'}: ${rankedBond.bond.issuerName} ${rankedBond.bond.coupon}% ${new Date(rankedBond.bond.maturity).getFullYear()}`;

  return {
    summary,
    bullets,
    math: rankedBond.explanation,
  };
}