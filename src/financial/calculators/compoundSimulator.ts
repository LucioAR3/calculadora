/**
 * Calculadora: simula contrato com juros compostos.
 * Usa Domain (contrato) + Core (matemática).
 */

import type { CompoundInterestContract } from '../domain'
import { compoundInterest, compoundAmount } from '../core'

export interface CompoundInterestResult {
  principal: number
  interest: number
  amount: number
  ratePerPeriod: number
  periods: number
}

/**
 * Simula contrato a juros compostos. Determinístico.
 */
export function simulateCompoundInterest(contract: CompoundInterestContract): CompoundInterestResult {
  const { principal, ratePerPeriod, periods } = contract
  const interest = compoundInterest(principal, ratePerPeriod, periods)
  const amount = compoundAmount(principal, ratePerPeriod, periods)
  return {
    principal,
    interest,
    amount,
    ratePerPeriod,
    periods,
  }
}
