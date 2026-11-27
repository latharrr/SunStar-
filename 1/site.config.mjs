// Single source of truth. Edit here, then run `node build.mjs`.
export default {
  name: 'Sunstar Systems', // TODO: confirm vs "Sunstar Sales"
  url: 'https://www.sunstarscales.com/experience/', // 3D experience page inside sunstarscales.com (noindex; main site is the canonical home)
  phoneDisplay: '09355349600',
  phoneE164: '+919355349600',
  whatsapp: 'https://wa.me/919355349600?text=Hi%20Sunstar%2C%20I%20need%20a%20quote',
  address: {
    street: '49, Main Road, Vivekanand Nagar, near Metro Pillar 804',
    city: 'Bahadurgarh',
    region: 'Haryana',
    postal: '124507',
    country: 'IN',
  },
  gstin: '06AGGPD2936C2ZW', // TODO: confirm with owner (public on TradeIndia)
  founded: 1996,
  stats: [
    { value: 30, decimals: 0, suffix: '+', label: 'Years in weighing' },
    { value: 4.4, decimals: 1, suffix: '★', label: 'Justdial rating' },
    { value: 60, decimals: 0, suffix: '+', label: 'Products' },
    { value: 24, decimals: 0, suffix: '×7', label: 'Service' },
  ],
};
