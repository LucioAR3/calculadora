/**
 * Padrão numérico do fluxo financeiro (BR):
 * - Unidades, dezenas, centenas, milhares, milhões: 0,50 | 1,00 | 1.000,00 | 1.000.000,00
 * - Decimal: vírgula. Milhares/milhões: ponto.
 */

/** Arredonda para no máximo 2 casas decimais (estrutura de números do projeto). */
export function to2Decimals(n: number): number {
  if (!Number.isFinite(n)) return n
  return Math.round(n * 100) / 100
}

/** Formata número para exibição com até 2 casas decimais (ponto decimal, sem milhares). */
export function formatDecimal(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  return n.toFixed(2)
}

/** Formata para exibição: inteiro sem decimais; caso contrário até 2 casas (ponto decimal). */
export function formatDecimalOptional(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  const rounded = Math.round(n * 100) / 100
  return rounded === Math.round(rounded) ? String(Math.round(rounded)) : rounded.toFixed(2)
}

/** Formata para exibição no padrão BR: vírgula decimal, ponto milhares. Ex.: 1.000,50 | 1.000.000 (inteiro sem ,00) */
export function formatDecimalBR(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  const rounded = to2Decimals(n)
  const isInt = rounded === Math.round(rounded)
  const [intPart, decPart] = rounded.toFixed(2).split('.')
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return isInt ? intFormatted : `${intFormatted},${decPart}`
}

/**
 * Parse de string no padrão BR (vírgula decimal, ponto milhares).
 * Aceita também US (um ponto como decimal, ex.: 1000.50) quando não há vírgula.
 */
export function parseDecimalBR(s: string): number {
  const t = String(s).trim().replace(/\s/g, '')
  if (t === '' || t === '-' || t === ',' || t === '.') return NaN
  if (/,/.test(t)) {
    const normalized = t.replace(/\./g, '').replace(',', '.')
    return parseFloat(normalized)
  }
  const parts = t.split('.')
  if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) return parseFloat(t)
  return parseFloat(t.replace(/\./g, ''))
}

/** Formata string de input (ex.: "1234,56") para exibição com milhares (ex.: "1.234,56"). */
export function formatDisplayBR(displayStr: string): string {
  const t = displayStr.trim()
  if (!t) return t
  const commaIdx = t.indexOf(',')
  if (commaIdx === -1) return t.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const intPart = t.slice(0, commaIdx).replace(/\D/g, '') || '0'
  const decPart = t.slice(commaIdx + 1).replace(/\D/g, '').slice(0, 2)
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decPart ? `${intFormatted},${decPart}` : `${intFormatted},`
}
