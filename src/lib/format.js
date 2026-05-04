export function formatMoney(value, currency = 'PKR') {
  if (value === null || value === undefined) return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  // Pakistani Rupee doesn't use decimals in everyday use; show no fractional digits unless present.
  const fractionDigits = Number.isInteger(n) ? 0 : 2;
  return `${currency} ${n.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  })}`;
}

export function humanStatus(status) {
  if (!status) return '';
  return status
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

const STATUS_COLOR = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
export function statusBadgeClass(status) {
  return STATUS_COLOR[status] || 'bg-stone-100 text-stone-700';
}
