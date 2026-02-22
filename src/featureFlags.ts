/**
 * Flags de funcionalidade (build-time).
 * Definidos por variáveis de ambiente VITE_* (embutidas no build).
 */

/** Ativar modo financeiro (simulador de juros). Default: false. Definir VITE_ENABLE_FINANCIAL=true para ativar. */
export const isFinancialModeEnabled =
  import.meta.env.VITE_ENABLE_FINANCIAL === 'true' ||
  import.meta.env.VITE_ENABLE_FINANCIAL === true
