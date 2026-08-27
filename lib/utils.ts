export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ' €'
}
