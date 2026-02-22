/**
 * Calculadora: simula contrato com juros simples.
 * Usa Domain (contrato) + Core (matemática).
 */

import type { SimpleInterestContract } from '../domain'
import { simpleInterest, simpleInterestAmount } from '../core'

export interface SimpleInterestResult {
  principal: number
  interest: number
  amount: number
  ratePerPeriod: number
  periods: number
}

/**
 * Simula contrato a juros simples. Determinístico.
 */
export function simulateSimpleInterest(contract: SimpleInterestContract): SimpleInterestResult {
  const { principal, ratePerPeriod, periods } = contract
  const interest = simpleInterest(principal, ratePerPeriod, periods)
  const amount = simpleInterestAmount(principal, ratePerPeriod, periods)
  return {
    principal,
    interest,
    amount,
    ratePerPeriod,
    periods,
  }
}
