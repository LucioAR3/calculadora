/**
 * Core: matemática pura de juros.
 * Sem conhecimento de contrato ou UI.
 */

/**
 * Juros simples: J = P * i * n
 * @param principal Valor principal
 * @param ratePerPeriod Taxa por período (ex.: 0.01 = 1%)
 * @param periods Número de períodos
 * @returns Valor dos juros
 */
export function simpleInterest(
  principal: number,
  ratePerPeriod: number,
  periods: number
): number {
  if (periods < 0 || principal < 0) return 0
  return principal * ratePerPeriod * periods
}

/**
 * Montante a juros simples: M = P + J = P * (1 + i * n)
 */
export function simpleInterestAmount(
  principal: number,
  ratePerPeriod: number,
  periods: number
): number {
  if (periods < 0 || principal < 0) return principal
  return principal * (1 + ratePerPeriod * periods)
}

/**
 * Juros compostos: J = P * ((1 + i)^n - 1)
 * @param principal Valor principal
 * @param ratePerPeriod Taxa por período (ex.: 0.01 = 1%)
 * @param periods Número de períodos
 * @returns Valor dos juros
 */
export function compoundInterest(
  principal: number,
  ratePerPeriod: number,
  periods: number
): number {
  if (periods < 0 || principal < 0) return 0
  if (periods === 0) return 0
  const amount = principal * Math.pow(1 + ratePerPeriod, periods)
  return amount - principal
}

/**
 * Montante a juros compostos: M = P * (1 + i)^n
 */
export function compoundAmount(
  principal: number,
  ratePerPeriod: number,
  periods: number
): number {
  if (periods < 0 || principal < 0) return principal
  if (periods === 0) return principal
  return principal * Math.pow(1 + ratePerPeriod, periods)
}

/**
 * Evolução do montante a juros compostos por período: [período 0, 1, ..., n].
 * Retorna array de { period, amount } para exibir evolução.
 */
export function compoundAmountByPeriod(
  principal: number,
  ratePerPeriod: number,
  periods: number
): Array<{ period: number; amount: number }> {
  if (periods < 0 || principal < 0) return []
  const out: Array<{ period: number; amount: number }> = []
  for (let n = 0; n <= periods; n++) {
    const amount = n === 0 ? principal : principal * Math.pow(1 + ratePerPeriod, n)
    out.push({ period: n, amount })
  }
  return out
}
