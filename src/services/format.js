var fa0 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0, useGrouping: false });
var fa1 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1, useGrouping: false });
var fa2 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2, useGrouping: false });

export function formatInteger(value) {
  return fa0.format(value);
}

export function formatNumber(value) {
  return fa2.format(value);
}

export function formatSigned(value) {
  var sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return sign + fa2.format(Math.abs(value));
}

export function formatDays(days) {
  if (days === null || days === undefined || Number.isNaN(days)) {
    return '—';
  }
  if (days < 1) {
    return fa0.format(Math.max(1, Math.round(days * 24))) + ' ساعت';
  }
  return fa1.format(days) + ' روز';
}
