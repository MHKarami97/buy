var tomanFormat = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })
var percentFormat = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })
var PERSIAN_ZERO = 0x06f0
var ARABIC_ZERO = 0x0660

export function formatToman(value) {
  return `${tomanFormat.format(Math.round(value ?? 0))} تومان`
}

export function formatPercent(value) {
  return `${percentFormat.format(Math.round(value))}٪`
}

/** Keeps only digits, converting Persian and Arabic-Indic digits to Latin ones. */
export function parseTomanInput(text) {
  return String(text ?? '')
    .replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - PERSIAN_ZERO))
    .replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - ARABIC_ZERO))
    .replace(/\D+/g, '')
    .replace(/^0+(?=\d)/, '')
}

/** "1200000" -> "1,200,000" (Latin digits keep the caret stable while typing). */
export function groupDigits(digits) {
  return String(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
