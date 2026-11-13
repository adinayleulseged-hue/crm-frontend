export function formatCurrency(amount: number, currency: string = 'ETB'): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseCurrency(str: string): number {
  const numericStr = str.replace(/[^0-9.-]+/g, "");
  const num = parseFloat(numericStr);
  return isNaN(num) ? 0 : num;
}
