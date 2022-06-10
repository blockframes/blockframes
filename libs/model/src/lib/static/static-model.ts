export const app = ['catalog', 'festival', 'financiers', 'crm'] as const;

export const modules = ['dashboard', 'marketplace'] as const;

export const privacies = ['public', 'protected'] as const;

export const appShortName = {
  catalog: 'AC',
  festival: 'AM',
  financiers: 'MF',
  blockframes: 'BF',
  crm: 'CRM',
  cms: 'CMS',
};

export const appName = {
  catalog: 'Archipel Content',
  festival: 'Archipel Market',
  financiers: 'Media Financiers',
  blockframes: 'Blockframes',
  crm: 'Blockframes CRM',
  cms: 'Blockframes CMS',
};

export const appDescription = {
  catalog:
    'Archipel Content is an ongoing digital marketplace for TV, VOD and ancillary rights. Let’s make content buying simple : One massive library, One package offer, One negotiation, One contract.',
  festival:
    'Archipel Market is an ongoing film market platform, one tool for your year-round promotion and acquisitions.',
  financiers:
    'Media Financiers enables private investors to co-produce exclusive films and TV series on the same conditions as top professional content financiers.',
};

export const contractStatus = {
  accepted: 'Accepted',
  declined: 'Declined',
  negotiating: 'In Negotiation',
  pending: 'New',
} as const

export const importContractStatus = ['In Negotiation', 'On Signature', 'Signed', 'Accepted', 'Declined'] as const;

export const contractType = {
  mandate: 'Mandate',
  sale: 'Sale'
} as const

export const offerStatus = {
  pending: ' New',
  negotiating: 'In Negotiation',
  accepted: ' Accepted',
  signing: 'On Signature',
  signed: 'Signed',
  declined: 'Declined',
} as const

export const negotiationStatus = ['pending', 'accepted', 'declined'] as const;

export const certifications = {
  artEssai: 'Art & Essai',
  eof: 'EOF',
  awardedFilm: 'Awarded Film',
  aListCast: 'A-list Cast',
  europeanQualification: 'European Qualification'
} as const

export const colors = {
  c: 'Color',
  b: 'Black & white',
  colorBW: 'Color & Black & White'
} as const

// @dev sort the value alphabetically, not the keys
export const contentType = {
  movie: 'Movie',
  tv: 'TV'
}

export const eventTypes = {
  meeting: 'Meeting',
  screening: 'Screening',
  slate: 'Slate Presentation',
  standard: 'Standard',
  local: 'Local'
} as const;

export const crewRoles = {
  writer: 'Writer',
  scoreComposer: 'Score Composer',
  dialogueWriter: 'Dialogue Writer',
  photographyDirector: 'Director of Photography',
  editor: 'Editor',
  castingDirector: 'Casting Director',
  artisticDirector: 'Artistic Director',
  costumeDesigner: 'Costume Designer',
  makeUpArtist: 'Make-Up Artist',
  productionDesigner: 'Production Designer',
  firstAssistantDirector: '1st Assistant Director',
  secondAssistantDirector: '2nd Assistant Director',
  postProductionDirector: 'Post-Production Director',
  originalAuthor: 'Original Author'
} as const

export const directorCategory = {
  firstFeature: 'First Feature',
  risingTalent: 'Rising Talent',
  confirmed: 'Confirmed Director',
  prestige: 'Prestige'
} as const

export const genres = {
  action: 'Action',
  adventure: 'Adventure',
  animation: 'Animation',
  biography: 'Biography',
  comedy: 'Comedy',
  crime: 'Crime',
  documentary: 'Documentary',
  drama: 'Drama',
  erotic: 'Erotic',
  family: 'Family',
  fantasy: 'Fantasy',
  horror: 'Horror',
  kidsAndTeen: 'Kids and teen',
  periodDrama: 'Period Drama',
  romance: 'Romance',
  scienceFiction: 'Science Fiction',
  thriller: 'Thriller',
} as const

export const hostedVideoTypes = {
  trailer: 'Trailer',
  teaser: 'Teaser',
  reel: 'Promo Reel',
  clip: 'Clip',
  other: 'Other'
} as const

// @TODO (#1658) Update LANGUAGES static model to be RFC-5646 compliant
export const languages = {
  afrikaans: 'Afrikaans',
  albanian: 'Albanian',
  arabic: 'Arabic',
  armenian: 'Armenian',
  azerbaijani: 'Azerbaijani',
  bambara: 'Bambara',
  basque: 'Basque',
  belarussian: 'Belarussian',
  bengali: 'Bengali',
  bosnian: 'Bosnian',
  bulgarian: 'Bulgarian',
  burmese: 'Burmese',
  cantonese: 'Cantonese',
  catalan: 'Catalan',
  croatian: 'Croatian',
  czech: 'Czech',
  danish: 'Danish',
  dutch: 'Dutch',
  dyula: 'Dyula',
  english: 'English',
  estonian: 'Estonian',
  filipino: 'Filipino',
  finnish: 'Finnish',
  flemish: 'Flemish',
  french: 'French',
  gaelic: 'Gaelic',
  galician: 'Galician',
  georgian: 'Georgian',
  german: 'German',
  greek: 'Greek',
  gujarati: 'Gujarati',
  haussa: 'Haussa',
  hebrew: 'Hebrew',
  hindi: 'Hindi',
  hungarian: 'Hungarian',
  icelandic: 'Icelandic',
  indonesian: 'Indonesian',
  italian: 'Italian',
  japanese: 'Japanese',
  javanese: 'Javanese',
  kannada: 'Kannada',
  kazakh: 'Kazakh',
  khmer: 'Khmer',
  korean: 'Korean',
  kosovan: 'Kosovan',
  kurdish: 'Kurdish',
  kyrgyz: 'Kyrgyz',
  laotian: 'Laotian',
  latvian: 'Latvian',
  lingala: 'Lingala',
  lithuanian: 'Lithuanian',
  macedonian: 'Macedonian',
  malayalam: 'Malayalam',
  maltese: 'Maltese',
  'mandarin-chinese': 'Mandarin Chinese',
  marathi: 'Marathi',
  maya: 'Maya',
  moldavian: 'Moldavian',
  montenegrin: 'Montenegrin',
  norwegian: 'Norwegian',
  oriya: 'Oriya',
  panjabi: 'Panjabi',
  papiamento: 'Papiamento',
  persian: 'Persian',
  polish: 'Polish',
  portuguese: 'Portuguese',
  romanian: 'Romanian',
  russian: 'Russian',
  serbian: 'Serbian',
  'serbo-croatian': 'Serbo-Croatian',
  slovak: 'Slovak',
  slovene: 'Slovene',
  spanish: 'Spanish',
  swahili: 'Swahili',
  swedish: 'Swedish',
  tajiki: 'Tajiki',
  tamil: 'Tamil',
  telugu: 'Telugu',
  tetum: 'Tetum',
  thai: 'Thai',
  turkish: 'Turkish',
  turkmen: 'Turkmen',
  ukrainian: 'Ukrainian',
  urdu: 'Urdu',
  uzbek: 'Uzbek',
  valencian: 'Valencian',
  vietnamese: 'Vietnamese',
  welsh: 'Welsh'
} as const

export const medias = {
  payTv: 'Pay TV',
  freeTv: 'Free TV',
  payPerView: 'Pay Per View',
  est: 'EST',
  nVod: 'N-VOD',
  aVod: 'A-VOD',
  fVod: 'F-VOD',
  sVod: 'S-VOD',
  tVod : 'T-VOD',
  inflight: 'Inflight',
  boats: 'Boats',
  hotels: 'Hotels',
  educational: 'Educational',
  festival : 'Festival',
  rental: 'Rental',
  through: 'Sell Through',
} as const

export const memberStatus = {
  confirmed: 'Confirmed',
  looselyAttached: 'Loosely Attached',
  target: 'Target'
} as const

export const movieCurrencies = {
  USD: 'US Dollar',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  GBP: 'Pound Sterling',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Renminbi',
  SEK: 'Swedish Krona',
  NZD: 'New Zealand Dollar'
} as const

export const movieCurrenciesSymbols = {
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'F',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$'
} as const;

export const movieFormat = {
  '1_33': '1.33',
  '1_37': '1.37',
  '1_66': '1.66',
  '1_77': '1.77',
  '1_85': '1.85',
  scope: 'SCOPE',
  '4/3': '4/3',
  '16/9': '16/9'
} as const

export const movieFormatQuality = {
  sd: 'SD',
  hd: 'HD',
  '2k': '2K',
  '4k': '4K',
  UHD: 'UHD',
  '3D': '3D',
  '3DSD': '3DSD',
  '3DHD': '3DHD',
  '3DUHD': '3DUHD'
} as const

export const movieLanguageTypes = {
  original: 'Original',
  dubbed: 'dubs',
  subtitle: 'subs',
  caption: 'CC',
} as const

export const premiereType = {
  international: 'International',
  world: 'World',
  market: 'Market',
  national: 'National',
} as const

export const producerRoles = {
  producer: 'Producer',
  executiveProducer: 'Executive Producer',
  associateProducer: 'Associate Producer'
} as const

export const productionStatus = {
  development: 'In Development',
  shooting: 'In Production',
  post_production: 'In Post-production',
  finished: 'Completed',
  released: 'Released'
} as const

export const promotionalElementTypes = {
  trailer: 'Trailer',
  poster: 'Poster',
  banner: 'Banner',
  still_photo: 'Stills',
  presentation_deck: 'Presentation deck',
  scenario: 'Script',
  moodboard: 'Moodboard'
} as const

export const rating = {
  pegi: 'PEGI',
  csa: 'CSA',
  cnc: 'CNC'
} as const

export const scoring = {
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D'
} as const

export const screeningStatus = {
  tobedetermined: 'To be determined',
  estimated: 'Estimated',
  confirmed: 'Confirmed'
} as const

export const shootingPeriod = {
  early: 'Early',
  mid: 'Mid',
  late: 'Late',
} as const

export const socialGoals = {
  no_poverty: 'No Poverty',
  hunger: 'Zero Hunger',
  gender_equality: 'Gender Equality',
  sanitation: 'Clean Water / Sanitation',
  well_being: 'Good Health and Well-being',
  education: 'Quality Education',
  clean_energy: 'Affordable and Clean Energy',
  work_and_growth: 'Decent Work and Economic Growth',
  industry: 'Industry, innovation and infrastructure',
  inequalities: 'Reduce inequalities',
  communities: 'Sustainable cities and communities',
  life_on_land: 'Life on land'
} as const

export const soundFormat = {
  mono: 'Mono',
  stereo: 'Stereo',
  dolbySR: 'Dolby SR',
  dts: 'DTS',
  'dolby-5.1': 'Dolby 5.1',
  'dolby-7.1': 'Dolby 7.1',
  thx: 'THX'
} as const

export const stakeholderRoles = {
  executiveProducer: 'Executive Producer',
  coProducer: 'Co-Producer',
  lineProducer: 'Line Producer',
  distributor: 'Distributor',
  salesAgent: 'Sales Agent',
  laboratory: 'Laboratory',
  financier: 'Financier',
  broadcasterCoproducer: 'Broadcaster coproducer'
} as const

export const storeStatus = {
  submitted: 'Submitted',
  accepted: 'Accepted',
  draft: 'Draft',
  refused: 'Refused',
  archived: 'Archived',
} as const

export const unitBox = {
  usd: 'USD',
  eur: 'EUR',
  admissions: 'Admissions',
} as const

export const orgActivity = {
  actor: 'Actor',
  buyersRep: 'Buyer\'s Rep',
  consulting: 'Consulting',
  director: 'Director',
  distribution: 'Distribution',
  filmCommission: 'Film Commission',
  filmFestival: 'Film Festival',
  filmFund: 'Film Fund',
  filmLibrary: 'Film Library',
  filmSchool: 'Film School',
  financialInstitution: 'Financial Institution',
  inflight: 'Inflight',
  institution: 'Institution',
  intlSales: 'International Sales',
  organization: 'Organization',
  press: 'Press',
  privateInvestor: 'Private Investor',
  production: 'Production',
  talentAgency: 'Talent Agency',
  technical: 'Technical',
  tvBroadcast: 'Television Broadcast',
  vodPlatform: 'VOD Platform',
  other: 'Other',
} as const

/** Status of an Organization, set to pending by default when an Organization is created. */
export const organizationStatus = {
  pending: 'Pending',
  onhold: 'On hold',
  accepted: 'Accepted'
} as const

export const invitationType = {
  attendEvent: 'Attend Event',
  joinOrganization: 'Join Organization'
} as const

export const invitationStatus = {
  accepted: 'Accepted',
  declined: 'Declined',
  pending: 'Pending'
} as const

export const festival = {
  berlinale: 'Berlin International Film Festival (The Berlinale)',
  bfta: 'BAFTA Film Awards',
  cannes: 'Cannes International Film Festival',
  goldenGlobe: 'Golden Globe Awards',
  locarno: 'Locarno International Film Festival',
  oscar: 'Oscar Academy Awards',
  rotterdam: 'International Film Festival Rotterdam',
  sanSebastian: 'San Sebastian International Film Festival',
  sundace: 'Sundance Film Festival',
  sxsw: 'SXSW Film Festival',
  toronto: 'Toronto International Film Festival (TIFF)',
  triBeCa: 'TriBeCa Film Festival',
  venice: 'Venice International Film Festival',
} as const

// Please keep territories' values in an alphabetic order !
export const territories = {
  world: 'World',
  "aland-islands": "Åland Islands",
  afghanistan: "Afghanistan",
  albania: "Albania",
  algeria: "Algeria",
  "american-samoa": "American Samoa",
  andorra: "Andorra",
  angola: "Angola",
  "anguilla-&-barbuda": "Anguilla",
  "antigua-and-barbuda": "Antigua and Barbuda",
  argentina: "Argentina",
  armenia: "Armenia",
  aruba: "Aruba",
  australia: "Australia",
  austria: "Austria",
  azerbaijan: "Azerbaijan",
  bahamas: "Bahamas",
  bahrain: "Bahrain",
  bangladesh: "Bangladesh",
  barbados: "Barbados",
  belarus: "Belarus",
  belgium: "Belgium",
  belize: "Belize",
  benin: "Benin",
  bermuda: "Bermuda",
  bhutan: "Bhutan",
  bolivia: "Bolivia",
  "bosnia-and-herzegovina": "Bosnia and Herzegovina",
  botswana: "Botswana",
  "bouvet-island": "Bouvet Island",
  brazil: "Brazil",
  "british-indian-ocean-territory": "British Indian Ocean Territory",
  brunei: "Brunei",
  bulgaria: "Bulgaria",
  burkina: "Burkina Faso",
  burundi: "Burundi",
  "cabo-verde": "Cabo Verde",
  cambodia: "Cambodia",
  cameroon: "Cameroon",
  canada: "Canada",
  "cayman-islands": "Cayman Islands",
  "central-african-republic": "Central African Republic",
  chad: "Chad",
  chile: "Chile",
  china: "China",
  colombia: "Colombia",
  comoros: "Comoros",
  "congo-democratic-republic": "Democratic Republic of the Congo",
  congo: "Congo (Congo-Brazzaville)",
  "cook-islands": "Cook Islands",
  "costa-rica": "Costa Rica",
  croatia: "Croatia",
  cuba: "Cuba",
  curacao: "Curaçao",
  cyprus: "Cyprus",
  "northern-cyprus": "Northern Cyprus",
  czech: "Czech Republic (Czechia)",
  denmark: "Denmark",
  djibouti: "Djibouti",
  dominica: "Dominica",
  "dominican-republic": "Dominican Republic",
  ecuador: "Ecuador",
  egypt: "Egypt",
  "el-salvador": "El Salvador",
  "equatorial-guinea": "Equatorial Guinea",
  eritrea: "Eritrea",
  estonia: "Estonia",
  eswatini: "Eswatini (former Swaziland)",
  ethiopia: "Ethiopia",
  "falkland-islands": "Falkland Islands",
  "faroe-islands": "Faroe Islands",
  fiji: "Fiji",
  finland: "Finland",
  france: "France",
  "french-polynesia": "French Polynesia",
  "french-southern-territories": "French Southern Territories",
  gabon: "Gabon",
  gambia: "Gambia",
  georgia: "Georgia",
  germany: "Germany",
  ghana: "Ghana",
  greece: "Greece",
  greenland: "Greenland",
  grenada: "Grenada",
  guam: "Guam",
  guatemala: "Guatemala",
  guernsey: "Guernsey",
  guinea: "Guinea",
  "guinea-bissau": "Guinea-Bissau",
  guyana: "Guyana",
  haiti: "Haiti",
  "heard-island-and-mcdonald-islands": "Heard Island and McDonald Islands",
  "holy-see": "Holy See",
  "honduras": "Honduras",
  "hong-kong": "Hong Kong",
  hungary: "Hungary",
  "iceland": "Iceland",
  "india": "India",
  "indonesia": "Indonesia",
  iran: "Iran",
  iraq: "Iraq",
  ireland: "Ireland",
  "isle-of-man": "Isle of Man",
  israel: "Israel",
  italy: "Italy",
  "ivory-coast-cote-d-ivoire": "Ivory Coast (Côte d’Ivoire)",
  jamaica: "Jamaica",
  japan: "Japan",
  jersey: "Jersey",
  jordan: "Jordan",
  kazakhstan: "Kazakhstan",
  kenya: "Kenya",
  kiribati: "Kiribati",
  "north-korea": "North Korea",
  "south-korea": "South Korea",
  kosovo: "Republic of Kosovo",
  kuwait: "Kuwait",
  kyrgyzstan: "Kyrgyzstan",
  laos: "Laos",
  latvia: "Latvia",
  lebanon: "Lebanon",
  lesotho: "Lesotho",
  liberia: "Liberia",
  libya: "Libya",
  liechtenstein: "Liechtenstein",
  lithuania: "Lithuania",
  luxembourg: "Luxembourg",
  macao: "Macao",
  madagascar: "Madagascar",
  malawi: "Malawi",
  malaysia: "Malaysia",
  maldives: "Maldives",
  mali: "Mali",
  malta: "Malta",
  marshall: "Marshall Islands",
  martinique: "Martinique",
  mauritania: "Mauritania",
  mauritius: "Mauritius",
  mexico: "Mexico",
  micronesia: "Micronesia",
  "midway-islands": "Midway Islands",
  moldova: "Moldova",
  monaco: "Monaco",
  mongolia: "Mongolia",
  montenegro: "Montenegro",
  montserrat: "Montserrat",
  morocco: "Morocco",
  mozambique: "Mozambique",
  myanmar: "Myanmar",
  namibia: "Namibia",
  nauru: "Nauru",
  nepal: "Nepal",
  netherlands: "Netherlands",
  "new-caledonia": "New Caledonia",
  "new-zealand": "New Zealand",
  nicaragua: "Nicaragua",
  niger: "Niger",
  nigeria: "Nigeria",
  niue: "Niue",
  "norfolk-island": "Norfolk Island",
  "north-macedonia": "North Macedonia",
  "northern-mariana-islands": "Northern Mariana Islands",
  norway: "Norway",
  "oman": "Oman",
  pakistan: "Pakistan",
  palau: "Palau",
  palestine: "Palestine",
  panama: "Panama",
  papua: "Papua New Guinea",
  paraguay: "Paraguay",
  peru: "Peru",
  philippines: "Philippines",
  pitcairn: "Pitcairn Islands",
  poland: "Poland",
  portugal: "Portugal",
  "puerto-rico": "Puerto Rico",
  qatar: "Qatar",
  romania: "Romania",
  russia: "Russia",
  rwanda: "Rwanda",
  "saint-barthelemy": "Saint Barthélemy",
  "saint-helena-ascension-and-tristan-da-cunha": "Saint Helena, Ascension and Tristan da Cunha",
  "saint-kitts-and-nevis": "Saint Kitts and Nevis",
  "saint-lucia": "Saint Lucia",
  "saint-martin-french": "Saint Martin (French part)",
  "saint-pierre-and-miquelon": "Saint Pierre and Miquelon",
  "saint-vincent-and-the-grenadines": "Saint Vincent and the Grenadines",
  samoa: "Samoa",
  "san-marino": "San Marino",
  "sao-tome-and-principe": "Sao Tome and Principe",
  "saudi-arabia": "Saudi Arabia",
  senegal: "Senegal",
  serbia: "Serbia",
  seychelles: "Seychelles",
  "sierra-leone": "Sierra Leone",
  singapore: "Singapore",
  "saint-martin-dutch": "Sint Maarten (Dutch part)",
  slovakia: "Slovakia",
  slovenia: "Slovenia",
  "solomon-islands": "Solomon Islands",
  somalia: "Somalia",
  somaliland: "Republic of Somaliland",
  "south-africa": "South Africa",
  "south-georgia": "South Georgia and the South Sandwich Islands",
  "south-sudan": "South Sudan",
  spain: "Spain",
  "sri-lanka": "Sri Lanka",
  sudan: "Sudan",
  suriname: "Suriname",
  sweden: "Sweden",
  switzerland: "Switzerland",
  syria: "Syria",
  taiwan: "Taiwan",
  tajikistan: "Tajikistan",
  tanzania: "Tanzania",
  thailand: "Thailand",
  "timor-leste": "Timor-Leste (East Timor)",
  togo: "Togo",
  tonga: "Tonga",
  "trinidad-and-tobago": "Trinidad and Tobago",
  tunisia: "Tunisia",
  turkey: "Turkey",
  turkmenistan: "Turkmenistan",
  "turks-and-caicos-islands": "Turks and Caicos Islands",
  uganda: "Uganda",
  ukraine: "Ukraine",
  "united-arab-emirates": "United Arab Emirates",
  "united-kingdom": "United Kingdom (UK)",
  "united-states-of-america": "United States of America (USA)",
  uruguay: "Uruguay",
  uzbekistan: "Uzbekistan",
  vanuatu: "Vanuatu",
  vatican: "Vatican City",
  venezuela: "Venezuela",
  vietnam: "Vietnam",
  "virgin-islands-uk": "British Virgin Islands",
  "virgin-islands-us": "United States Virgin Islands",
  "wallis-and-futuna": "Wallis and Futuna",
  "western-sahara": "Western Sahara",
  yemen: "Yemen",
  zambia: "Zambia",
  zimbabwe: "Zimbabwe",
} as const

export const territoriesISOA2 = {
  world: '',
  afghanistan: 'AF',
  albania: 'AL',
  algeria: 'DZ',
  'american-samoa': 'AS',
  andorra: 'AD',
  angola: 'AO',
  'anguilla-&-barbuda': 'AI',
  'antigua-and-barbuda': 'AG',
  argentina: 'AR',
  armenia: 'AM',
  aruba: 'AW',
  australia: 'AU',
  austria: 'AT',
  azerbaijan: 'AZ',
  bahamas: 'BS',
  bahrain: 'BH',
  bangladesh: 'BD',
  barbados: 'BB',
  belarus: 'BY',
  belgium: 'BE',
  belize: 'BZ',
  benin: 'BJ',
  bermuda: 'BM',
  bhutan: 'BT',
  bolivia: 'BO',
  'bosnia-and-herzegovina': 'BA',
  botswana: 'BW',
  'bouvet-island': 'BV',
  brazil: 'BR',
  'british-indian-ocean-territory': 'IO',
  brunei: 'BN',
  bulgaria: 'BG',
  burkina: 'BF',
  burundi: 'BI',
  'cabo-verde': 'CV',
  cambodia: 'KH',
  cameroon: 'CM',
  canada: 'CA',
  'cayman-islands': 'KY',
  'central-african-republic': 'CF',
  chad: 'TD',
  chile: 'CL',
  china: 'CN',
  colombia: 'CO',
  comoros: 'KM',
  'congo-democratic-republic': 'CD',
  congo: 'CG',
  'cook-islands': 'CK',
  'costa-rica': 'CR',
  croatia: 'HR',
  cuba: 'CU',
  curacao: 'CW',
  cyprus: 'CY',
  'northern-cyprus': '-97',
  czech: 'CZ',
  'ivory-coast-cote-d-ivoire': 'CI',
  denmark: 'DK',
  djibouti: 'DJ',
  dominica: 'DM',
  'dominican-republic': 'DO',
  ecuador: 'EC',
  egypt: 'EG',
  'el-salvador': 'SV',
  'equatorial-guinea': 'GQ',
  eritrea: 'ER',
  estonia: 'EE',
  eswatini: 'SZ',
  ethiopia: 'ET',
  'falkland-islands': 'FK',
  'faroe-islands': 'FO',
  fiji: 'FJ',
  finland: 'FI',
  france: 'FR',
  'french-polynesia': 'PF',
  'french-southern-territories': 'TF',
  gabon: 'GA',
  gambia: 'GM',
  georgia: 'GE',
  germany: 'DE',
  ghana: 'GH',
  greece: 'GR',
  greenland: 'GL',
  grenada: 'GD',
  guam: 'GU',
  guatemala: 'GT',
  guernsey: 'GG',
  guinea: 'GN',
  'guinea-bissau': 'GW',
  guyana: 'GY',
  haiti: 'HT',
  'heard-island-and-mcdonald-islands': 'HM',
  'holy-see': 'VA',
  honduras: 'HN',
  'hong-kong': 'HK',
  hungary: 'HU',
  iceland: 'IS',
  india: 'IN',
  indonesia: 'ID',
  iran: 'IR',
  iraq: 'IQ',
  ireland: 'IE',
  'isle-of-man': 'IM',
  israel: 'IL',
  italy: 'IT',
  jamaica: 'JM',
  japan: 'JP',
  jersey: 'JE',
  jordan: 'JO',
  kazakhstan: 'KZ',
  kenya: 'KE',
  kiribati: 'KI',
  'north-korea': 'KP',
  'south-korea': 'KR',
  kosovo: '-98',
  kuwait: 'KW',
  kyrgyzstan: 'KG',
  laos: 'LA',
  latvia: 'LV',
  lebanon: 'LB',
  lesotho: 'LS',
  liberia: 'LR',
  libya: 'LY',
  liechtenstein: 'LI',
  lithuania: 'LT',
  luxembourg: 'LU',
  macao: 'MO',
  madagascar: 'MG',
  malawi: 'MW',
  malaysia: 'MY',
  maldives: 'MV',
  mali: 'ML',
  malta: 'MT',
  marshall: 'MH',
  martinique: 'MQ',
  mauritania: 'MR',
  mauritius: 'MU',
  mexico: 'MX',
  micronesia: 'FM',
  moldova: 'MD',
  monaco: 'MC',
  mongolia: 'MN',
  montenegro: 'ME',
  montserrat: 'MS',
  morocco: 'MA',
  mozambique: 'MZ',
  myanmar: 'MM',
  namibia: 'NA',
  nauru: 'NR',
  nepal: 'NP',
  netherlands: 'NL',
  'new-caledonia': 'NC',
  'new-zealand': 'NZ',
  nicaragua: 'NI',
  niger: 'NE',
  nigeria: 'NG',
  niue: 'NU',
  'norfolk-island': 'NF',
  'north-macedonia': 'MK',
  'northern-mariana-islands': 'MP',
  norway: 'NO',
  oman: 'OM',
  pakistan: 'PK',
  palau: 'PW',
  palestine: 'PS',
  panama: 'PA',
  papua: 'PG',
  paraguay: 'PY',
  peru: 'PE',
  philippines: 'PH',
  pitcairn: 'PN',
  poland: 'PL',
  portugal: 'PT',
  'puerto-rico': 'PR',
  qatar: 'QA',
  romania: 'RO',
  russia: 'RU',
  rwanda: 'RW',
  'saint-barthelemy': 'BL',
  'saint-helena-ascension-and-tristan-da-cunha': 'SH',
  'saint-kitts-and-nevis': 'KN',
  'saint-lucia': 'LC',
  'saint-martin-french': 'MF',
  'saint-pierre-and-miquelon': 'PM',
  'saint-vincent-and-the-grenadines': 'VC',
  samoa: 'WS',
  'san-marino': 'SM',
  'sao-tome-and-principe': 'ST',
  'saudi-arabia': 'SA',
  senegal: 'SN',
  serbia: 'RS',
  seychelles: 'SC',
  'sierra-leone': 'SL',
  singapore: 'SG',
  'saint-martin-dutch': 'SX',
  slovakia: 'SK',
  slovenia: 'SI',
  'solomon-islands': 'SB',
  somalia: 'SO',
  somaliland: '-99',
  'south-africa': 'ZA',
  'south-georgia': 'GS',
  'south-sudan': 'SS',
  spain: 'ES',
  'sri-lanka': 'LK',
  sudan: 'SD',
  suriname: 'SR',
  sweden: 'SE',
  switzerland: 'CH',
  syria: 'SY',
  taiwan: 'TW',
  tajikistan: 'TJ',
  tanzania: 'TZ',
  thailand: 'TH',
  'timor-leste': 'TL',
  togo: 'TG',
  tonga: 'TO',
  'trinidad-and-tobago': 'TT',
  tunisia: 'TN',
  turkey: 'TR',
  turkmenistan: 'TM',
  'turks-and-caicos-islands': 'TC',
  uganda: 'UG',
  ukraine: 'UA',
  'united-arab-emirates': 'AE',
  'united-kingdom': 'GB',
  'united-states-of-america': 'US',
  uruguay: 'UY',
  uzbekistan: 'UZ',
  vanuatu: 'VU',
  vatican: 'VA',
  venezuela: 'VE',
  vietnam: 'VN',
  'virgin-islands-uk': 'VG',
  'virgin-islands-us': 'VI',
  'wallis-and-futuna': 'WF',
  'western-sahara': 'EH',
  yemen: 'YE',
  zambia: 'ZM',
  zimbabwe: 'ZW',
  'aland-islands': 'AX'
} as const

export const territoriesISOA3 = {
  world: '',
  afghanistan: 'AFG',
  albania: 'ALB',
  algeria: 'DZA',
  'american-samoa': 'ASM',
  andorra: 'AND',
  angola: 'AGO',
  'anguilla-&-barbuda': 'AIA',
  'antigua-and-barbuda': 'ATG',
  argentina: 'ARG',
  armenia: 'ARM',
  aruba: 'ABW',
  australia: 'AUS',
  austria: 'AUT',
  azerbaijan: 'AZE',
  bahamas: 'BHS',
  bahrain: 'BHR',
  bangladesh: 'BGD',
  barbados: 'BRB',
  belarus: 'BLR',
  belgium: 'BEL',
  belize: 'BLZ',
  benin: 'BEN',
  bermuda: 'BMU',
  bhutan: 'BTN',
  bolivia: 'BOL',
  'bosnia-and-herzegovina': 'BIH',
  botswana: 'BWA',
  'bouvet-island': 'BVT',
  brazil: 'BRA',
  'british-indian-ocean-territory': 'IOT',
  brunei: 'BRN',
  bulgaria: 'BGR',
  burkina: 'BFA',
  burundi: 'BDI',
  'cabo-verde': 'CPV',
  cambodia: 'KHM',
  cameroon: 'CMR',
  canada: 'CAN',
  'cayman-islands': 'CYM',
  'central-african-republic': 'CAF',
  chad: 'TCD',
  chile: 'CHL',
  china: 'CHN',
  colombia: 'COL',
  comoros: 'COM',
  'congo-democratic-republic': 'COD',
  congo: 'COG',
  'cook-islands': 'COK',
  'costa-rica': 'CRI',
  croatia: 'HRV',
  cuba: 'CUB',
  curacao: 'CUW',
  cyprus: 'CYP',
  'northern-cyprus': '-97',
  czech: 'CZE',
  'ivory-coast-cote-d-ivoire': 'CIV',
  denmark: 'DNK',
  djibouti: 'DJI',
  dominica: 'DMA',
  'dominican-republic': 'DOM',
  ecuador: 'ECU',
  egypt: 'EGY',
  'el-salvador': 'SLV',
  'equatorial-guinea': 'GNQ',
  eritrea: 'ERI',
  estonia: 'EST',
  eswatini: 'SWZ',
  ethiopia: 'ETH',
  'falkland-islands': 'FLK',
  'faroe-islands': 'FRO',
  fiji: 'FJI',
  finland: 'FIN',
  france: 'FRA',
  'french-polynesia': 'PYF',
  'french-southern-territories': 'ATF',
  gabon: 'GAB',
  gambia: 'GMB',
  georgia: 'GEO',
  germany: 'DEU',
  ghana: 'GHA',
  greece: 'GRC',
  greenland: 'GRL',
  grenada: 'GRD',
  guam: 'GUM',
  guatemala: 'GTM',
  guernsey: 'GGY',
  guinea: 'GIN',
  'guinea-bissau': 'GNB',
  guyana: 'GUY',
  haiti: 'HTI',
  'heard-island-and-mcdonald-islands': 'HMD',
  'holy-see': 'VAT',
  honduras: 'HND',
  'hong-kong': 'HKG',
  hungary: 'HUN',
  iceland: 'ISL',
  india: 'IND',
  indonesia: 'IDN',
  iran: 'IRN',
  iraq: 'IRQ',
  ireland: 'IRL',
  'isle-of-man': 'IMN',
  israel: 'ISR',
  italy: 'ITA',
  jamaica: 'JAM',
  japan: 'JPN',
  jersey: 'JEY',
  jordan: 'JOR',
  kazakhstan: 'KAZ',
  kenya: 'KEN',
  kiribati: 'KIR',
  'north-korea': 'PRK',
  'south-korea': 'KOR',
  kosovo: '-98',
  kuwait: 'KWT',
  kyrgyzstan: 'KGZ',
  laos: 'LAO',
  latvia: 'LVA',
  lebanon: 'LBN',
  lesotho: 'LSO',
  liberia: 'LBR',
  libya: 'LBY',
  liechtenstein: 'LIE',
  lithuania: 'LTU',
  luxembourg: 'LUX',
  macao: 'MAC',
  madagascar: 'MDG',
  malawi: 'MWI',
  malaysia: 'MYS',
  maldives: 'MDV',
  mali: 'MLI',
  malta: 'MLT',
  marshall: 'MHL',
  mauritania: 'MRT',
  mauritius: 'MUS',
  mexico: 'MEX',
  micronesia: 'FSM',
  moldova: 'MDA',
  monaco: 'MCO',
  mongolia: 'MNG',
  montenegro: 'MNE',
  montserrat: 'MSR',
  morocco: 'MAR',
  mozambique: 'MOZ',
  myanmar: 'MMR',
  namibia: 'NAM',
  nauru: 'NRU',
  nepal: 'NPL',
  netherlands: 'NLD',
  'new-caledonia': 'NCL',
  'new-zealand': 'NZL',
  nicaragua: 'NIC',
  niger: 'NER',
  nigeria: 'NGA',
  niue: 'NIU',
  'norfolk-island': 'NFK',
  'north-macedonia': 'MKD',
  'northern-mariana-islands': 'MNP',
  norway: 'NOR',
  oman: 'OMN',
  pakistan: 'PAK',
  palau: 'PLW',
  palestine: 'PSE',
  panama: 'PAN',
  papua: 'PNG',
  paraguay: 'PRY',
  peru: 'PER',
  philippines: 'PHL',
  pitcairn: 'PCN',
  poland: 'POL',
  portugal: 'PRT',
  'puerto-rico': 'PRI',
  qatar: 'QAT',
  romania: 'ROU',
  russia: 'RUS',
  rwanda: 'RWA',
  'saint-barthelemy': 'BLM',
  'saint-helena-ascension-and-tristan-da-cunha': 'SHN',
  'saint-kitts-and-nevis': 'KNA',
  'saint-lucia': 'LCA',
  'saint-martin-french': 'MAF',
  'saint-pierre-and-miquelon': 'SPM',
  'saint-vincent-and-the-grenadines': 'VCT',
  samoa: 'WSM',
  'san-marino': 'SMR',
  'sao-tome-and-principe': 'STP',
  'saudi-arabia': 'SAU',
  senegal: 'SEN',
  serbia: 'SRB',
  seychelles: 'SYC',
  'sierra-leone': 'SLE',
  singapore: 'SGP',
  'saint-martin-dutch': 'SXM',
  slovakia: 'SVK',
  slovenia: 'SVN',
  'solomon-islands': 'SLB',
  somalia: 'SOM',
  somaliland: '-99',
  'south-africa': 'ZAF',
  'south-georgia': 'SGS',
  'south-sudan': 'SSD',
  spain: 'ESP',
  'sri-lanka': 'LKA',
  sudan: 'SDN',
  suriname: 'SUR',
  sweden: 'SWE',
  switzerland: 'CHE',
  syria: 'SYR',
  taiwan: 'TWN',
  tajikistan: 'TJK',
  tanzania: 'TZA',
  thailand: 'THA',
  'timor-leste': 'TLS',
  togo: 'TGO',
  tonga: 'TON',
  'trinidad-and-tobago': 'TTO',
  tunisia: 'TUN',
  turkey: 'TUR',
  turkmenistan: 'TKM',
  'turks-and-caicos-islands': 'TCA',
  uganda: 'UGA',
  ukraine: 'UKR',
  'united-arab-emirates': 'ARE',
  'united-kingdom': 'GBR',
  'united-states-of-america': 'USA',
  uruguay: 'URY',
  uzbekistan: 'UZB',
  vanuatu: 'VUT',
  vatican: 'VAT',
  venezuela: 'VEN',
  vietnam: 'VNM',
  'virgin-islands-uk': 'VGB',
  'virgin-islands-us': 'VIR',
  'wallis-and-futuna': 'WLF',
  'western-sahara': 'ESH',
  yemen: 'YEM',
  zambia: 'ZMB',
  zimbabwe: 'ZWE',
  'aland-islands': 'ALA'
} as const

export const months = {
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December'
} as const

export const budgetRange = {
  10000000: 'Less than $1 million',
  20000000: '$1 - 2 millions',
  35000000: '$2 - 3.5 millions',
  50000000: '$3.5 - 5 millions',
  100000000: '$5 - 10 millions',
  200000000: '$10 - 20 millions',
  999999999: 'More than $20 millions'
} as const;

export const accessibility = {
  public: 'Public',
  protected: 'Protected',
  private: 'Private',
} as const;

/**
 * https://docs.google.com/spreadsheets/d/1z4FFNABgDyRGgD5AQZf-ebWbA_m-7hlueFMCVUuk2fI/edit#gid=279324582
 */
const movieFormFields = {
  promotional: 'Promotional Elements',
  audience: 'Positioning',
  boxOffice: 'Box Office',
  cast: 'Cast Members',
  certifications: 'Qualifications',
  color: 'Color',
  contentType: 'Content Type',
  crew: 'Crew Members',
  customGenres: 'Genres',
  directors: 'Director',
  estimatedBudget: 'Budget',
  expectedPremiere: 'Expected Premiere',
  format: 'Shooting Format',
  formatQuality: 'Format Quality',
  genres: 'Genres',
  internalRef: 'Title Reference',
  keyAssets: 'Key Assets',
  keywords: 'Keywords',
  languages: 'Versions',
  logline: 'Logline',
  isOriginalVersionAvailable: 'Original Version',
  originalLanguages: 'Original Language(s)',
  originalRelease: 'Release',
  originCountries: 'Country of Origin',
  prizes: 'Festivals & Awards',
  customPrizes: 'Festivals & Awards',
  producers: 'Producer',
  productionStatus: 'Production Status',
  rating: 'Rating',
  release: 'Release',
  review: 'Selections & Reviews',
  runningTime: 'Running Time',
  shooting: 'Shooting Information',
  soundFormat: 'Sound Format',
  stakeholders: 'Production Companies',
  synopsis: 'Synopsis',
  title: 'Title',
  delivery: 'Files',
} as const;

export const staticModel = {
  budgetRange,
  contractStatus,
  contractType,
  certifications,
  colors,
  contentType,
  crewRoles,
  directorCategory,
  eventTypes,
  genres,
  hostedVideoTypes,
  invitationType,
  invitationStatus,
  languages,
  medias,
  memberStatus,
  movieCurrencies,
  movieCurrenciesSymbols,
  movieFormat,
  movieFormatQuality,
  movieLanguageTypes,
  premiereType,
  producerRoles,
  productionStatus,
  promotionalElementTypes,
  rating,
  scoring,
  orgActivity,
  soundFormat,
  stakeholderRoles,
  storeStatus,
  unitBox,
  organizationStatus,
  festival,
  months,
  screeningStatus,
  shootingPeriod,
  socialGoals,
  territories,
  territoriesISOA2,
  territoriesISOA3,
  appName,
  offerStatus,
  movieFormFields,
  accessibility
};

export type StaticModel = typeof staticModel;
export type Scope = keyof StaticModel;
export type GetKeys<S extends Scope> = keyof StaticModel[S];
export type GetLabel<S extends Scope> = StaticModel[S][GetKeys<S>]
export type GetCode<S extends Scope> = GetKeys<S> | GetLabel<S>;

/** Check if the given value is a key of a scope */
export const isInKeys = (scope: Scope, givenValue: string) => {
  return (Object.keys(staticModel[scope])).map((key) => key).includes(givenValue);
}

/**
 * @param slug
 */
export function getISO3166TerritoryFromSlug(slug: keyof typeof territories) {
  const territory = Object.keys(territories).find(i => i.toLowerCase() === slug.toLowerCase());
  if (!territory) {
    throw new Error(`Failed to territory: ${slug}.`);
  }
  return {
    [territory]: territory,
    iso_a2: territoriesISOA2[territory],
  }
}

export function parseToAll<S extends Scope>(scope: S, allKey: string) {
  const keys = Object.keys(staticModel[scope]) as GetKeys<S>[];
  return keys.filter(key => key !== allKey)
}
