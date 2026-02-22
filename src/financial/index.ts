/**
 * Facade do Financial Engine.
 * Expõe apenas o necessário para a UI/adaptador.
 */

export type { SimpleInterestContract, FinancialContract } from './domain'
export { simulateSimpleInterest, type SimpleInterestResult } from './calculators'
