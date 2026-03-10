/**
 * Facade do Financial Engine.
 * Expõe apenas o necessário para a UI/adaptador.
 * Fluxo linear: Origin → Contract → Modifiers → Destination.
 */

export type { SimpleInterestContract, CompoundInterestContract, FinancialContract } from './domain'
export type { Entity, EntityRole } from './domain'
export type { Modifier, PercentDeductionModifier } from './domain'
export type { ProcessDefinition } from './domain'
export { simulateSimpleInterest, type SimpleInterestResult } from './calculators'
export { simulateCompoundInterest, type CompoundInterestResult } from './calculators'
export { percentOf, applyPercentDeduction, compoundAmountByPeriod } from './core'
export { runProcess, type OrchestratorResult, type HistoryStep } from './orchestrator'
