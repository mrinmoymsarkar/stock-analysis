/**
 * Finance utility functions for SIP/goal planning calculations.
 *
 * All SIP formulas use monthly compounding (annuity-due convention):
 * investments are made at the START of each month, which is the standard
 * Indian SIP convention.
 */

/**
 * Monthly SIP Future Value (annuity-due).
 *
 * FV = P × [((1 + i)^n − 1) / i] × (1 + i)
 * where i = annualRatePct / 12 / 100  (monthly rate)
 *
 * Edge case: when i = 0, FV = P × n (simple accumulation, no interest).
 *
 * @param monthlyAmount  Monthly SIP instalment in INR
 * @param annualRatePct  Expected annual return in percent (e.g. 12 for 12%)
 * @param months         Investment tenure in months
 * @returns              Future value in INR
 */
export function sipFutureValue(
  monthlyAmount: number,
  annualRatePct: number,
  months: number
): number {
  const i = annualRatePct / 12 / 100;
  if (i === 0) {
    return monthlyAmount * months;
  }
  return monthlyAmount * (((Math.pow(1 + i, months) - 1) / i) * (1 + i));
}

/**
 * Lumpsum Future Value (annual compounding).
 *
 * FV = P × (1 + r)^n
 * where r = annualRatePct / 100
 *
 * @param principal      Initial investment in INR
 * @param annualRatePct  Expected annual return in percent
 * @param years          Investment tenure in years
 * @returns              Future value in INR
 */
export function lumpsumFutureValue(
  principal: number,
  annualRatePct: number,
  years: number
): number {
  const r = annualRatePct / 100;
  return principal * Math.pow(1 + r, years);
}

/**
 * Required monthly SIP to reach a target amount (inverse of sipFutureValue).
 *
 * P = FV × i / [((1 + i)^n − 1) × (1 + i)]
 *
 * Edge case: when i = 0, P = targetAmount / months.
 *
 * @param targetAmount   Desired future corpus in INR
 * @param annualRatePct  Expected annual return in percent
 * @param months         Investment tenure in months
 * @returns              Required monthly SIP amount in INR
 */
export function requiredSip(
  targetAmount: number,
  annualRatePct: number,
  months: number
): number {
  const i = annualRatePct / 12 / 100;
  if (i === 0) {
    return targetAmount / months;
  }
  const fvFactor = ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  return targetAmount / fvFactor;
}

/**
 * Step-up SIP Future Value.
 *
 * The monthly contribution increases by `annualStepUpPct` percent at the
 * start of each new year (i.e. months 13, 25, 37, …). Calculation is done
 * year-by-year: each year's SIP tranche grows for the remaining duration.
 *
 * When annualStepUpPct = 0 this is identical to sipFutureValue.
 *
 * @param monthlyAmount    Starting monthly SIP instalment in INR
 * @param annualRatePct    Expected annual return in percent
 * @param months           Total investment tenure in months
 * @param annualStepUpPct  Annual step-up rate in percent (e.g. 10 for 10%)
 * @returns                Future value in INR
 */
export function stepUpSipFutureValue(
  monthlyAmount: number,
  annualRatePct: number,
  months: number,
  annualStepUpPct: number
): number {
  const i = annualRatePct / 12 / 100;
  const stepRate = annualStepUpPct / 100;

  let totalFV = 0;
  let currentSip = monthlyAmount;
  let remainingMonths = months;

  while (remainingMonths > 0) {
    const monthsThisYear = Math.min(12, remainingMonths);
    // FV of this year's SIP tranche grown for the full remaining period
    if (i === 0) {
      totalFV += currentSip * monthsThisYear;
    } else {
      // FV at the END of this year's tranche (annuity-due for monthsThisYear months)
      const fvEndOfTranche =
        currentSip * (((Math.pow(1 + i, monthsThisYear) - 1) / i) * (1 + i));
      // Then compound that lump sum for the remaining months AFTER this tranche
      const monthsAfter = remainingMonths - monthsThisYear;
      totalFV += fvEndOfTranche * Math.pow(1 + i, monthsAfter);
    }
    currentSip = currentSip * (1 + stepRate);
    remainingMonths -= monthsThisYear;
  }

  return totalFV;
}

/**
 * Inflation-adjusted (real) value — today's purchasing-power equivalent.
 *
 * realValue = amount / (1 + inflationPct/100)^years
 *
 * @param amount        Nominal future amount in INR
 * @param inflationPct  Annual inflation rate in percent (e.g. 6 for 6%)
 * @param years         Number of years in the future
 * @returns             Today's-money equivalent in INR
 */
export function inflationAdjusted(
  amount: number,
  inflationPct: number,
  years: number
): number {
  const rate = inflationPct / 100;
  return amount / Math.pow(1 + rate, years);
}

/** A single data point returned by sipProjection */
export interface ProjectionPoint {
  /** Month number (1-based) */
  month: number;
  /** Cumulative amount invested so far */
  invested: number;
  /** Portfolio value (FV) at this point */
  value: number;
}

/**
 * Generates a time series of (month, invested, value) data points suitable
 * for charting a SIP projection.
 *
 * For horizons > 24 months the series is sampled at yearly intervals plus the
 * final month to keep the data set compact. For shorter horizons every month
 * is included.
 *
 * Supports optional annual step-up (pass 0 or omit for a flat SIP).
 *
 * @param monthlyAmount    Starting monthly SIP instalment in INR
 * @param annualRatePct    Expected annual return in percent
 * @param months           Total tenure in months
 * @param annualStepUpPct  Annual step-up percentage (default 0)
 * @returns                Array of ProjectionPoint sorted by month ascending
 */
export function sipProjection(
  monthlyAmount: number,
  annualRatePct: number,
  months: number,
  annualStepUpPct = 0
): ProjectionPoint[] {
  const i = annualRatePct / 12 / 100;
  const stepRate = annualStepUpPct / 100;
  const sample = months > 24;

  const points: ProjectionPoint[] = [];

  // Track running portfolio value month-by-month
  // For each month m (1-based): figure out the current SIP amount after step-ups
  let portfolioValue = 0;
  let cumulativeInvested = 0;

  for (let m = 1; m <= months; m++) {
    // Step-up applies: SIP for year y = monthlyAmount * (1 + stepRate)^(y-1)
    const yearIndex = Math.floor((m - 1) / 12);
    const currentSip = monthlyAmount * Math.pow(1 + stepRate, yearIndex);

    // Annuity-due: invest at start of month, then compound for this month
    if (i === 0) {
      portfolioValue += currentSip;
    } else {
      portfolioValue = (portfolioValue + currentSip) * (1 + i);
    }
    cumulativeInvested += currentSip;

    const isYearEnd = m % 12 === 0;
    const isFinalMonth = m === months;

    if (!sample || isYearEnd || isFinalMonth) {
      points.push({
        month: m,
        invested: Math.round(cumulativeInvested),
        value: Math.round(portfolioValue),
      });
    }
  }

  return points;
}
