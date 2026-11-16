var tomanFormat = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })

export function formatToman(value) {
  return `${tomanFormat.format(Math.round(value ?? 0))} تومان`
}

export function formatPercent(value) {
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(Math.round(value))}٪`
}
