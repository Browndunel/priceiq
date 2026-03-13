export const formatPrice = (price, currency = '€') =>
  `${currency}${Number(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

export const RETAILER_COLORS = {
  'Amazon':       '#FF9900', 'Walmart':      '#0071CE', 'Best Buy':     '#003399',
  'Target':       '#CC0000', 'Costco':       '#E31837', 'eBay':         '#86B817',
  'Newegg':       '#FF6600', 'B&H':          '#1E5FA8', 'Micro Center': '#DA291C', 'Adorama': '#0069A3',
}
