import { BondType } from '@prisma/client';

export interface TaxProfile {
  state: string;
  filingStatus: 'SINGLE' | 'MARRIED_JOINT' | 'MARRIED_SEPARATE' | 'HEAD_OF_HOUSEHOLD';
  federalRate: number;
  stateRate: number;
  localRate?: number;
  amtApplies?: boolean;
  niitApplies?: boolean;
}

export interface BondData {
  type: BondType;
  state?: string;
  ytw: number;
  price: number;
  coupon: number;
  maturity: Date;
  federalTaxExempt: boolean;
  stateTaxExempt: boolean;
  amt: boolean;
  callable?: boolean;
  callSchedule?: any;
}

export interface ATYTWResult {
  atytw: number;
  preTaxYtw: number;
  effectiveTaxRate: number;
  taxBreakdown: {
    federal: number;
    state: number;
    local: number;
    amt?: number;
    niit?: number;
  };
  oidAdjustment?: number;
  explanation: string[];
}

export function computeATYTW(bond: BondData, userTax: TaxProfile): ATYTWResult {
  const preTaxYtw = bond.ytw;
  let effectiveTaxRate = 0;
  const taxBreakdown = {
    federal: 0,
    state: 0,
    local: 0,
    amt: 0,
    niit: 0,
  };
  const explanation: string[] = [];

  switch (bond.type) {
    case 'TREASURY':
      taxBreakdown.federal = userTax.federalRate;
      if (userTax.niitApplies) {
        taxBreakdown.niit = 0.038;
      }
      explanation.push('Treasury: Federal taxable, state/local exempt');
      break;

    case 'MUNICIPAL':
      const isInState = bond.state === userTax.state;

      if (!bond.federalTaxExempt) {
        taxBreakdown.federal = userTax.federalRate;
        explanation.push('Taxable municipal: Federal taxable');
      } else {
        explanation.push('Tax-exempt municipal: Federal exempt');
      }

      if (bond.amt && userTax.amtApplies) {
        taxBreakdown.amt = 0.28;
        explanation.push('AMT applies to this private activity bond');
      }

      if (!isInState || !bond.stateTaxExempt) {
        taxBreakdown.state = userTax.stateRate;
        if (userTax.localRate) {
          taxBreakdown.local = userTax.localRate;
        }
        explanation.push(`Out-of-state muni: State${userTax.localRate ? '/local' : ''} taxable`);
      } else {
        explanation.push(`In-state muni: State${userTax.localRate ? '/local' : ''} exempt`);
      }
      break;

    case 'CORPORATE':
    case 'AGENCY':
      taxBreakdown.federal = userTax.federalRate;
      taxBreakdown.state = userTax.stateRate;
      if (userTax.localRate) {
        taxBreakdown.local = userTax.localRate;
      }
      if (userTax.niitApplies) {
        taxBreakdown.niit = 0.038;
      }
      explanation.push(`${bond.type === 'CORPORATE' ? 'Corporate' : 'Agency'}: Fully taxable`);
      break;

    case 'TAXABLE_MUNI':
      taxBreakdown.federal = userTax.federalRate;
      taxBreakdown.state = userTax.stateRate;
      if (userTax.localRate) {
        taxBreakdown.local = userTax.localRate;
      }
      explanation.push('Taxable municipal: Fully taxable');
      break;
  }

  effectiveTaxRate = Math.min(
    taxBreakdown.federal +
    taxBreakdown.state +
    taxBreakdown.local +
    Math.max(taxBreakdown.amt - taxBreakdown.federal, 0) +
    taxBreakdown.niit,
    0.999
  );

  let oidAdjustment = 0;
  if (bond.price < 100) {
    const oid = checkOID(bond);
    if (oid.hasOID) {
      oidAdjustment = oid.adjustment;
      explanation.push(`OID detected (price ${bond.price.toFixed(2)}): ${oid.deminimis ? 'De minimis' : 'Market discount'} adjustment ${oidAdjustment.toFixed(0)} bps`);
    }
  } else if (bond.price > 100) {
    explanation.push(`Premium bond (price ${bond.price.toFixed(2)}): Amortizable premium reduces taxable income`);
  }

  const atytw = preTaxYtw * (1 - effectiveTaxRate) - (oidAdjustment / 10000);

  explanation.push(`Effective tax rate: ${(effectiveTaxRate * 100).toFixed(1)}%`);
  explanation.push(`After-tax YTW: ${atytw.toFixed(3)}%`);

  return {
    atytw,
    preTaxYtw,
    effectiveTaxRate,
    taxBreakdown,
    oidAdjustment,
    explanation,
  };
}

function checkOID(bond: BondData): { hasOID: boolean; deminimis: boolean; adjustment: number } {
  const yearsToMaturity = (bond.maturity.getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000);
  const deminimisThreshold = 100 - (0.25 * yearsToMaturity);

  if (bond.price < deminimisThreshold) {
    const discount = 100 - bond.price;
    const annualAccretion = discount / yearsToMaturity;
    const adjustment = annualAccretion * 0.37 * 100;
    return { hasOID: true, deminimis: true, adjustment };
  } else if (bond.price < 100) {
    const discount = 100 - bond.price;
    const annualAccretion = discount / yearsToMaturity;
    const adjustment = annualAccretion * 0.15 * 100;
    return { hasOID: true, deminimis: false, adjustment };
  }

  return { hasOID: false, deminimis: false, adjustment: 0 };
}

export function compareAfterTaxEquivalent(
  homeBond: BondData,
  nationalBond: BondData,
  userTax: TaxProfile
): {
  homeATYTW: number;
  nationalATYTW: number;
  advantage: number;
  recommendation: string;
} {
  const homeResult = computeATYTW(homeBond, userTax);
  const nationalResult = computeATYTW(nationalBond, userTax);

  const advantage = homeResult.atytw - nationalResult.atytw;

  let recommendation = '';
  if (Math.abs(advantage) < 0.05) {
    recommendation = 'Equivalent after-tax yields';
  } else if (advantage > 0) {
    recommendation = `Home-state bond yields ${(advantage * 100).toFixed(0)} bps more after-tax`;
  } else {
    recommendation = `National bond yields ${(Math.abs(advantage) * 100).toFixed(0)} bps more after-tax`;
  }

  return {
    homeATYTW: homeResult.atytw,
    nationalATYTW: nationalResult.atytw,
    advantage,
    recommendation,
  };
}