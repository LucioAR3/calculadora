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
