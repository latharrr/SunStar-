// Single source of truth for sunstarscales.com.
// Edit here, then run `node build.mjs`. Anything marked TODO must be confirmed with Sunstar before launch.

export const site = {
  name: 'Sunstar Systems',
  brand: 'Sunstar',
  domain: 'https://www.sunstarscales.com', // TODO: confirm www vs apex once DNS is set
  tagline: 'Digital weighing scales, platform scales, weighbridges and load cells, made and serviced in Bahadurgarh, Haryana since 1996.',
  founded: 1996,
  founder: 'Surender Kumar Dhayal', // Managing Director (TradeIndia / Justdial listing)
  phoneDisplay: '093553 49600',
  phoneE164: '+919355349600', // TODO: confirm this is the number for website enquiries (bot will use a new number)
  whatsappNumber: '919355349600',
  email: '', // TODO: business email
  gstin: '06AGGPD2936C2ZW', // TODO: confirm with owner (public on TradeIndia)
  iso: '', // TODO: e.g. 'ISO 9001:2015' — only once a valid certificate is seen
  address: {
    street: '49, Main Road, Vivekanand Nagar, near Metro Pillar No. 804',
    city: 'Bahadurgarh',
    district: 'Jhajjar',
    region: 'Haryana',
    postal: '124507',
    country: 'IN',
  },
  geo: null, // TODO: { lat: 28.69, lng: 76.93 } — copy exact pin from Google Business Profile
  hours: 'Opens 9:00 am, call ahead for timings', // TODO: full weekly hours
  rating: { value: '4.4', count: 15, source: 'Justdial' }, // shown as text only, not in schema
  profiles: [ // TODO: add IndiaMART + Google Business Profile URLs
    'https://www.justdial.com/Bahadurgarh-Haryana/Sunstar-Systems-Near-Metro-Pillar-No-804-Vivekanand-Nagar/9999P1276-1276-140725145758-Q8B9_BZDET',
    'https://sunstarsystems.tradeindia.com/',
  ],
  // Client marks. Only list a brand once Sunstar confirms you may name it.
  clients: [
    { name: 'bigbasket', confirmed: true }, // stated by client in intake
    { name: 'Client 2', confirmed: false },
    { name: 'Client 3', confirmed: false },
    { name: 'Client 4', confirmed: false },
    { name: 'Client 5', confirmed: false },
    { name: 'Client 6', confirmed: false },
  ],
  regions: [
    { name: 'North India', places: 'Delhi NCR, Haryana, Punjab, Himachal Pradesh, Uttarakhand, Uttar Pradesh, Rajasthan' },
    { name: 'Jammu & Kashmir and Ladakh', places: 'Jammu, Srinagar, Kathua, Udhampur, Leh' },
    { name: 'South India', places: 'Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, Telangana, Puducherry' },
    { name: 'North East', places: 'Assam, Meghalaya, Tripura, Manipur, Nagaland, Mizoram, Arunachal Pradesh, Sikkim' },
    { name: 'West & Central', places: 'Gujarat, Maharashtra, Goa, Madhya Pradesh, Chhattisgarh' },
    { name: 'East', places: 'West Bengal, Bihar, Jharkhand, Odisha' },
  ],
};

export const categories = [
  {
    slug: 'tabletop-scales', name: 'Tabletop & counter scales', short: 'Tabletop',
    plate: 'bg-cream', hero: 'ss-30',
    range: 'Up to 30 kg',
    intro: 'Digital tabletop and counter scales for shops, kitchens, packing lines and dispatch desks. Stainless steel pans, bright LED displays and AC/DC power with a rechargeable battery.',
    uses: ['Grocery & kirana', 'Sweet & dry-fruit shops', 'Packing & dispatch', 'Restaurants & cloud kitchens', 'Small manufacturing'],
  },
  {
    slug: 'price-computing-scales', name: 'Price computing scales', short: 'Price computing',
    plate: 'bg-orange', hero: 'sst-30',
    range: 'Up to 30 kg',
    intro: 'Weight, rate and total amount on one scale, with a raised pole display the customer can read. Built for retail counters that weigh and bill all day.',
    uses: ['Fruit & vegetable shops', 'Supermarkets', 'Meat & fish counters', 'Sweet shops'],
  },
  {
    slug: 'platform-scales', name: 'Platform & industrial scales', short: 'Platform',
    plate: 'bg-charcoal', hero: 'ss-pf100',
    range: '50 kg and up',
    intro: 'Heavy-duty platform scales for warehouses, factories and loading bays. Diamond-plate or stainless platforms, column-mounted indicators and a strong backrest frame.',
    uses: ['Manufacturing units', 'Warehouses & godowns', 'Logistics & courier hubs', 'Grain & produce mandis', 'Scrap & recycling'],
  },
  {
    slug: 'jewellery-scales', name: 'Jewellery & precision scales', short: 'Jewellery',
    plate: 'bg-soft', hero: null,
    range: 'Fine readability',
    intro: 'Jewellery scales, precision balances and pocket scales for gold, silver, gems, laboratories and pharmacies.',
    types: ['Jewellery weighing scale', 'Silver weighing scale', 'Precision balance', 'Pocket scale', 'Diamond / carat scale'],
    uses: ['Jewellers', 'Silver traders', 'Laboratories', 'Pharmacies'],
  },
  {
    slug: 'weighbridges', name: 'Weighbridges', short: 'Weighbridges',
    plate: 'bg-charcoal', hero: null,
    range: 'Truck scales',
    intro: 'Electronic weighbridges for trucks and lorries: pit type, pitless, mobile and portable, supplied with indicator and load cells and installed on site.',
    types: ['Pit type weighbridge', 'Pitless weighbridge', 'Mobile weighbridge', 'Portable weighbridge', 'Truck / lorry weighbridge'],
    uses: ['Factories & plants', 'Mandis & cold storage', 'Mines & quarries', 'Logistics yards'],
  },
  {
    slug: 'load-cells', name: 'Load cells & indicators', short: 'Load cells',
    plate: 'bg-orange', hero: null,
    range: 'Sensors & displays',
    intro: 'Replacement and OEM load cells and weighing indicators for weighbridges, platform scales, tanks, hoppers and machines.',
    types: ['Compression load cell', 'S-type load cell', 'Shear beam load cell', 'Single point load cell', 'Weighing indicator'],
    uses: ['Weighbridge repair', 'Tank & silo weighing', 'Machine builders', 'Platform scale upgrades'],
  },
  {
    slug: 'special-scales', name: 'Crane, hanging & special scales', short: 'Special',
    plate: 'bg-cream', hero: 'ss-cs1000',
    range: 'Made for the job',
    intro: 'Crane scales, hanging scales, LPG cylinder scales, baby and personal scales, piece counting scales and barcode label printing scales.',
    types: ['Crane scale', 'Hanging scale', 'LPG cylinder scale', 'Baby / medical scale', 'Personal scale', 'Piece counting scale', 'Barcode label printing scale', 'GSM testing machine'],
    uses: ['Factories & stores', 'Gas agencies', 'Clinics & hospitals', 'Retail billing'],
  },
];

// Products with real photos. specs: only values printed on the product label are filled.
// Everything else stays in `ask` and is shown as "Confirm on enquiry".
export const products = [
  {
    slug: 'ss-30', model: 'SS-30', wm: 'SS-30', name: 'SS-30 Digital Tabletop Scale', cat: 'tabletop-scales',
    img: { file: 'ss-30', w: 1233, h: 761 }, plate: 'bg-cream',
    line: 'Glossy red body, stainless steel pan and a large red LED readout.',
    desc: 'A compact digital tabletop scale with a stainless steel pan and a bright red LED display. Memory keys (M+, MR+) and a mode key cover everyday counter weighing.',
    specs: [['Capacity', '30 kg'], ['Minimum', '100 g'], ['Readability (e)', '2 g'], ['Pan', 'Stainless steel'], ['Display', 'Red LED'], ['Keys', 'Zero/Tare, M+, MR+, Mode']],
    ask: ['Pan size', 'Power & battery backup', 'Stamping / verification'],
  },
  {
    slug: 'stainless-tabletop', model: null, wm: 'Steel', name: 'Stainless Steel Tabletop Scale', cat: 'tabletop-scales',
    img: { file: 'stainless-tabletop', w: 1072, h: 763 }, plate: 'bg-charcoal',
    line: 'Stainless steel from pan to body, built for counters that are washed down.',
    desc: 'An all-stainless digital weighing scale for wet and busy counters: meat, fish, dairy and sweet shops. Runs on AC or DC.',
    specs: [['Body', 'Stainless steel'], ['Pan', 'Stainless steel'], ['Display', 'LED'], ['Power', 'AC / DC'], ['Keys', 'Zero/Tare, M+, MR, Mode']],
    ask: ['Capacity options', 'Readability', 'Pan size'],
  },
  {
    slug: 'steel-pan-tabletop', model: null, wm: 'Steel', name: 'Steel-Pan Digital Weighing Scale', cat: 'tabletop-scales',
    img: { file: 'steel-pan-tabletop', w: 1018, h: 759 }, plate: 'bg-soft',
    line: 'White body, wide stainless pan, AC/DC power.',
    desc: 'A digital weighing scale with a wide stainless steel pan on a white body. A practical everyday scale for shops and packing desks.',
    specs: [['Pan', 'Stainless steel'], ['Body', 'White'], ['Display', 'LED'], ['Power', 'AC / DC'], ['Keys', 'Zero/Tare, M+, MR, Mode']],
    ask: ['Capacity options', 'Readability', 'Pan size'],
  },
  {
    slug: 'electronic-tabletop', model: null, wm: '30 kg', name: 'Electronic Tabletop Scale', cat: 'tabletop-scales',
    img: { file: 'electronic-tabletop', w: 1101, h: 753 }, plate: 'bg-cream',
    line: 'Navy pan, green front panel, Made in India.',
    desc: 'An electronic weighing scale with a large covered pan and a green front panel. Zero/Tare, memory and calibration keys.',
    specs: [['Capacity', '30 kg'], ['Minimum', '100 g'], ['Readability (e)', '2 g'], ['Display', 'LED'], ['Keys', 'Zero/Tare, M+, MR, Cal/Mode']],
    ask: ['Pan size', 'Power & battery backup'],
  },
  {
    slug: 'compact-tabletop', model: null, wm: 'Digital', name: 'Compact Digital Weighing Scale', cat: 'tabletop-scales',
    img: { file: 'compact-tabletop', w: 1008, h: 865 }, plate: 'bg-soft',
    line: 'Textured ABS pan and a simple four-key panel.',
    desc: 'A light, compact digital weighing scale with a textured pan and four keys: Mode/Cal, Shift, Up and Tare/Zero.',
    specs: [['Pan', 'Textured ABS'], ['Display', 'LED'], ['Keys', 'Mode/Cal, Shift, Up, Tare/Zero']],
    ask: ['Capacity options', 'Readability', 'Power'],
  },
  {
    slug: 'sst-30', model: 'SST-30', wm: 'SST-30', name: 'SST-30 Price Computing Scale with Pole Display', cat: 'price-computing-scales',
    img: { file: 'sst-30', w: 928, h: 1196 }, plate: 'bg-orange',
    line: 'Raised pole display so the customer reads the same number you do.',
    desc: 'A multifunction scale with a stainless steel pan and a raised pole display facing the customer. Made for retail counters that weigh and bill all day.',
    specs: [['Capacity', '30 kg'], ['Minimum', '100 g'], ['Readability (e)', '2 g'], ['Pan', 'Stainless steel'], ['Display', 'Front + pole LED']],
    ask: ['Rate & total functions', 'Power & battery backup'],
  },
  {
    slug: 'ss-pf100', model: 'SS-PF100', wm: 'PF100', name: 'SS-PF100 Digital Platform Weighing Scale', cat: 'platform-scales',
    img: { file: 'platform-diamond', w: 874, h: 1369 }, plate: 'bg-charcoal',
    line: 'Diamond-plate steel platform with a handle frame, for loading bays and sacks that arrive by the hundred.',
    desc: 'Heavy-duty digital multifunction weighing scale with a robust steel platform and ergonomic handle frame. Rechargeable battery, tare and auto power-off.',
    specs: [['Capacity', '100 / 200 / 300 kg'], ['Accuracy', '± 10 g'], ['Platform', 'MS diamond plate'], ['Frame', 'Tubular steel handle'], ['Power', 'Rechargeable battery'], ['Functions', 'Tare, auto power-off']],
    ask: ['Platform size'],
  },
  {
    slug: 'ss-fs500', model: 'SS-FS500', wm: 'FS500', name: 'SS-FS500 Industrial Floor Scale', cat: 'platform-scales',
    img: { file: 'ss-fs500', w: 434, h: 227 }, plate: 'bg-cream',
    line: 'Low floor platform for pallets, drums and bulk goods.',
    desc: 'Heavy-duty industrial floor scale with a diamond-plate platform designed for high-capacity weighing, with a separate indicator unit.',
    specs: [['Capacity', '500 / 1000 / 2000 kg'], ['Accuracy', '± 50 g'], ['Platform', 'MS checkered plate'], ['Build', 'Heavy-duty'], ['Indicator', 'Separate unit']],
    ask: ['Platform size', 'Power'],
  },
  {
    slug: 'ssp-50', model: 'SSP-50', wm: 'SSP-50', name: 'SSP-50 Platform Scale, Stainless Top', cat: 'platform-scales',
    img: { file: 'ssp-50', w: 770, h: 1546 }, plate: 'bg-cream',
    line: 'Stainless platform, backrest and a raised indicator for parcels and sacks.',
    desc: 'A platform scale with a stainless steel top, tubular backrest and raised digital indicator. Ideal for parcels, sacks and dispatch.',
    specs: [['Capacity', '50 kg'], ['Minimum', '100 g'], ['Readability (e)', '5 g'], ['Platform', 'Stainless steel'], ['Indicator', 'Raised LED']],
    ask: ['Platform size', 'Higher capacities', 'Power & battery backup'],
  },
  {
    slug: 'ss-cs1000', model: 'SS-CS1000', wm: 'CS1000', name: 'SS-CS1000 OCS Electronic Crane Scale', cat: 'special-scales',
    img: { file: 'ss-cs1000', w: 372, h: 763 }, plate: 'bg-cream',
    line: 'Hangs from the hook, reads on a bright LED display.',
    desc: 'Rugged electronic crane scale with a bright LED display for overhead weighing in factories, stores and loading areas. Wireless remote control.',
    specs: [['Capacity', '1000 / 3000 / 5000 kg'], ['Accuracy', '± 0.5 kg'], ['Display', 'Bright LED'], ['Control', 'Wireless remote'], ['Housing', 'Rugged, heat resistant']],
    ask: ['Battery backup'],
  },
  {
    slug: 'ss-eb200', model: 'SS-EB200', wm: 'EB200', name: 'SS-EB200 Electronic Precision Balance', cat: 'jewellery-scales',
    img: null, plate: 'bg-soft',
    line: 'Glass wind shield for readings to a thousandth of a gram.',
    desc: 'High-precision electronic analytical balance with a glass wind-shield enclosure for laboratories and jewellery. Weighs in g, tola and carat.',
    specs: [['Capacity', '200 / 300 / 500 g'], ['Accuracy', '± 0.001 g'], ['Enclosure', 'Glass wind shield'], ['Units', 'g, tola, ct']],
    ask: ['Pan size', 'Power'],
  },
  {
    slug: 'ss-as2000', model: 'SS-AS2000', wm: 'AS2000', name: 'SS-AS2000 Cattle / Livestock Weighing Scale', cat: 'special-scales',
    img: null, plate: 'bg-soft',
    line: 'Four-post frame keeps the animal on the platform while it is weighed.',
    desc: 'Livestock and animal weighing scale with a four-corner post frame to safely contain animals during weighing, an animal-hold function and an anti-slip platform.',
    specs: [['Capacity', '1000 / 2000 kg'], ['Accuracy', '± 100 g'], ['Frame', 'Four-post containment'], ['Platform', 'Anti-slip'], ['Function', 'Animal hold']],
    ask: ['Platform size'],
  },
];

export const faqs = {
  common: [
    ['What is the price of a Sunstar weighing scale?', 'Prices depend on capacity, model and quantity. Message us on WhatsApp with the model and we reply with today’s price.'],
    ['Do you deliver outside Haryana?', 'Yes. We dispatch across India, including South India, the North East and Jammu & Kashmir.'],
    ['Where is your shop?', '49, Main Road, Vivekanand Nagar, near Metro Pillar No. 804, Bahadurgarh, Haryana 124507.'],
    ['Do you repair and calibrate scales?', 'Yes. We service, repair and calibrate weighing scales, and supply replacement load cells and indicators.'],
  ],
};
