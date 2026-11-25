// Single source of truth. Edit here, then run `node build.mjs`.
export default {
  name: 'Sunstar Systems', // TODO: confirm vs "Sunstar Sales"
  url: 'https://www.example.com/', // TODO: real domain (used by canonical, OG, JSON-LD)
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
  gstin: 'TBC', // TODO: GST number
  founded: 1996,
  stats: [
    { value: 30, decimals: 0, suffix: '+', label: 'Years in weighing' },
    { value: 4.4, decimals: 1, suffix: '★', label: 'Justdial rating' },
    { value: 60, decimals: 0, suffix: '+', label: 'Products' },
    { value: 24, decimals: 0, suffix: '×7', label: 'Service' },
  ],
};
