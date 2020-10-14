export const contractStatus = {
  accepted: 'Accepted',
  paid: 'Paid',
  unknown: 'Unknown',
  waitingsignature: 'Waiting for signature',
  waitingpayment: 'Waiting for payment',
  rejected: 'Rejected',
  aborted: 'Aborted',
  /**
   * @dev first status of a contract
   * Starting from this status, the contract is visible by creator only
   */
  draft: 'Draft',
  /**
   * @dev once the user hit the submit button, the contract is waiting for approvment
   * Starting from this status, the contract is visible by creator (but not editable anymore) and by admins
   */
  submitted: 'Submitted',
  /**
   * @dev when an admin checked a "submitted" contract and all seems good.
   * Starting from this status, contract is visible for every parties
   */
  undernegotiation: 'Under negotiation',
} as const

export const contractType = {
  mandate: 'Mandate',
  sale: 'Sale'
} as const

export const legalDocumentTypes = {
  chain_of_titles: 'Chain of titles',
  invoices: 'Invoices'
} as const

export const legalRoles = {
  undefined: 'Undefined role',
  serviceProvider: 'Service provider', // service-provider
  licensor: 'Licensor',
  licensee: 'Licensee',
  seller: 'Seller',
  lender: 'Lender',
  promisor: 'Promisor',
  promisee: 'Promisee',
  beneficiary: 'Beneficiary',
  thirdParty: 'Third party', // third-party
  purchaser: 'Purchaser'
} as const

export const subLicensorRoles = {
  signatory: 'Signatory',
  observator: 'Observator'
} as const

export const licenseStatus = {
  unknown: 'unknown',
  undernegotiation: 'under negotiation',
  waitingsignature: 'waiting for signature',
  waitingpayment: 'waiting for paiment',
  paid: 'paid'
} as const

export const distributionRightStatus = {
  /**
   * @dev first status of a right
   * Starting from this status, the right is visible by creator only
   */
  draft: 'Draft',

  /**
   * @dev first status of a right
   * Starting from this status, the right is visible by creator only
   */
  cart: 'In cart',

  /**
   * @dev the right have been sold
   */
  sold: 'Sold',

  /**
   * @dev in this status, a contract should exists regarding this distribution right.
   * When Contract status changes, this could change too
   */
  undernegotiation: 'Under negotiation',
} as const

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

export const contentType = {
  feature_film: 'Feature Film',
  short: 'Short Film',
  serie: 'Tv Serie',
  season: 'Season',
  volume: 'Volume',
  episode: 'Episode',
  collection: 'Collection',
  tv_film: 'TV Film',
  flow: 'Flow'
}

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
  comedy: 'Comedy',
  drama: 'Drama',
  action: 'Action',
  horror: 'Horror',
  scienceFiction: 'Science Fiction', // science-fiction
  thriller: 'Thriller',
  comingAge: 'Young Adult', // coming-of-age
  fantasy: 'Fantasy',
  romance: 'Romance',
  western: 'Western',
  periodPiece: 'Period Piece', // period-piece
  adventure: 'Adventure',
  biography: 'Biography',
  war: 'War',
  police: 'Police',
  animation: 'Animation',
  documentary: 'Documentary',
  erotic: 'Erotic',
  tvShow: 'TV Show', //tv-show
  webSeries: 'Web Series', //web-series
  virtualReality: 'Virtual Reality', // virtual-reality
  family: 'Family',
} as const

export const hostedVideoTypes = {
  tailer: 'Trailer',
  teaser: 'Teaser',
  reel: 'Reel',
  clip: 'Clip',
  pitch: 'Pitch',
} as const

// @TODO (#1658) Update LANGUAGES static model to be RFC-5646 compliant
export const languages = {
  all: 'All languages',
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
  moldavian: 'Moldavian',
  montenegrin: 'Montenegrin',
  norwegian: 'Norwegian',
  oriya: 'Oriya',
  panjabi: 'Panjabi',
  persian: 'Persian',
  polish: 'Polish',
  portuguese: 'Portuguese',
  romanian: 'Romanian',
  russian: 'Russian',
  serbian: 'Serbian',
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
  payTv: 'Pay TV', // pay-tv
  freeTv: 'Free TV', // free-tv
  payPerView: 'Pay Per View', // pay-per-view
  est: 'EST',
  nVod: 'N-VOD', // n-vod
  aVod: 'A-VOD', // a-vod
  fVod: 'F-VOD', // f-vod
  sVod: 'S-VOD', // s-vod
  theatrical: 'Theatrical',
  video: 'Video',
  planes: 'Planes',
  boats: 'Boats',
  hotels: 'Hotels',
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
  dubbed: 'Dubbed',
  subtitle: 'Subtitled',
  caption: 'Closed-Captions',
} as const

export const premiereType = {
  international: 'International',
  world: 'World',
  market: 'Market',
  national: 'National',
} as const

export const producerRoles = {
  executiveProducer: 'Executive Producer',
  lineProducer: 'Line Producer',
  associateProducer: 'Associate Producer',
  productionManager: 'Production Manager'
} as const

export const productionStatus = {
  development: 'In development',
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
  promo_reel_link: 'Promo reel',
  screener_link: 'Screener',
  trailer_link: 'Trailer',
  teaser_link: 'Teaser',
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
  late: 'Late',
  mid: 'Mid',
} as const

export const socialGoals = {
  no_poverty: 'No Poverty',
  hunger: 'Zero Hunger',
  gender_equality: 'Gender Equality',
  sanitation: 'Clean Water / Sanitation',
  weel_being: 'Good Health and Well-being',
  education: 'Quality Education',
  clean_energy: 'Affordable and CLean Energy',
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
} as const

export const storeType = {
  library: 'Library',
  line_up: 'Line-Up',
} as const;

export const unitBox = {
  usd: 'USD',
  eur: 'EUR',
  admissions: 'Admissions',
} as const

export const cartStatus = {
  pending: 'Pending',
  submitted: 'Submitted',
  accepted: 'Accepted',
  paid: 'Paid'
} as const

export const orgActivity = {
  production: 'Production',
  intlSales: 'International Sales',
  distribution: 'Distribution',
  tvBroadcast: 'Television Broadcast',
  vodPlatform: 'VOD Platform',
  theatricalExhibition: 'Theatrical Exhibition',
  buyersRep: 'Buyer\'s Rep',
  filmFestival: 'Film Festival',
  filmFund: 'Film Fund',
  filmLibrary: 'Film Library',
  filmCommission: 'Film Commission',
  financialInstitution: 'Financial Institution',
  press: 'Press',
  inflight: 'Inflight',
} as const

/** Status of an Organization, set to pending by default when an Organization is created. */
export const organizationStatus = {
  pending: 'Pending',
  accepted: 'Accepted'
} as const

export const festival = {
  cannes: 'Cannes International Film Festival',
  venice: 'Venice International Film Festival',
  berlinale: 'Berlin International Film Festival (The Berlinale)',
  toronto: 'Toronto International Film Festival (TIFF)',
  sundace: 'Sundance Film Festival',
  locarno: 'Locarno International Film Festival',
  rotterdam: 'International Film Festival Rotterdam',
  triBeCa: 'TriBeCa Film Festival',
  sxsw: 'SXSW Film Festival',
  sanSebastian: 'San Sebastian International Film Festival',
  oscar: 'Oscar Academy Awards',
  goldenGlobe: 'Golden Globe Awards',
  bfta: 'BAFTA Film Awards'
} as const

export const territories = {
  ambia: "Zambia",
  "aland-islands": "Åland Islands",
  afghanistan: "Afghanistan",
  albania: "Albania",
  algeria: "Algeria",
  "american-samoa": "American Samoa",
  andorra: "Andorra",
  angola: "Angola",
  "anguilla-&-barbuda": "Anguilla",
  antartica: "Antarctica",
  "antigua-and-barbuda": "Antigua and Barbuda",
  argentina: "Argentina",
  armenia: "Armenia",
  aruba: "Aruba",
  australia: "Australia",
  austria: "Austria",
  azerbaijan: "Azerbaijan",
  bahamas: "Bahamas (the)",
  bahrain: "Bahrain",
  bangladesh: "Bangladesh",
  barbados: "Barbados",
  belarus: "Belarus",
  belgium: "Belgium",
  belize: "Belize",
  benin: "Benin",
  bermuda: "Bermuda",
  bhutan: "Bhutan",
  bolivia: "Bolivia (Plurinational State of)",
  bonaire: "Bonaire",
  "sint-eustatius-and-saba": "Sint Eustatius and Saba",
  "bosnia-and-herzegovina": "Bosnia and Herzegovina",
  botswana: "Botswana",
  "bouvet-island": "Bouvet Island",
  brazil: "Brazil",
  "british-indian-ocean-territory": "British Indian Ocean Territory (the)",
  brunei: "Brunei Darussalam",
  bulgaria: "Bulgaria",
  burkina: "Burkina Faso",
  burundi: "Burundi",
  "cabo-verde": "Cabo Verde",
  cambodia: "Cambodia",
  cameroon: "Cameroon",
  canada: "Canada",
  "cayman-islands": "Cayman Islands (the)",
  "central-african-republic": "Central African Republic (the)",
  chad: "Chad",
  chile: "Chile",
  china: "China",
  "christmas- island": "Christmas Island",
  "cocos-islands": "Cocos (Keeling) Islands (the)",
  colombia: "Colombia",
  comoros: "Comoros (the)",
  "congo-democratic-republic": "Congo (the Democratic Republic of the)",
  congo: "Congo (the)",
  "cook-islands": "Cook Islands(the)",
  "costa-rica": "Costa Rica",
  croatia: "Croatia",
  cuba: "Cuba",
  curacao: "Curaçao",
  cyprus: "Cyprus",
  "northern-cyprus": "Turkish Republic of Northern Cyprus",
  czech: "Czechia",
  "cote-d-ivoire": "Côte d'Ivoire",
  denmark: "Denmark",
  djibouti: "Djibouti",
  dominica: "Dominica",
  "dominican-republic": "Dominican Republic (the)",
  ecuador: "Ecuador",
  egypt: "Egypt",
  "el-salvador": "El Salvador",
  "equatorial-guinea": "Equatorial Guinea",
  eritrea: "Eritrea",
  estonia: "Estonia",
  eswatini: "Eswatini",
  ethiopia: "Ethiopia",
  "falkland-islands": "Falkland Islands (the) [Malvinas]",
  "faroe-islands": "Faroe Islands (the)",
  fiji: "Fiji",
  finland: "Finland",
  france: "France",
  "french-guiana": "French Guiana",
  "french-polynesia": "French Polynesia",
  "french-southern-territories": "French Southern Territories (the)",
  gabon: "Gabon",
  gambia: "Gambia(the)",
  georgia: "Georgia",
  germany: "Germany",
  ghana: "Ghana",
  gibraltar: "Gibraltar",
  greece: "Greece",
  greenland: "Greenland",
  grenada: "Grenada",
  guadeloupe: "Guadeloupe",
  guam: "Guam",
  guatemala: "Guatemala",
  guernsey: "Guernsey",
  guinea: "Guinea",
  "guinea-bissau": "Guinea-Bissau",
  guyana: "Guyana",
  haiti: "Haiti",
  "heard-island-and-mcdonald-islands": "Heard Island and McDonald Islands",
  "holy-see": "Holy See (the)",
  "honduras": "Honduras",
  "hong-kong": "Hong Kong",
  hungary: "Hungary",
  "iceland": "Iceland",
  "india": "India",
  "indonesia": "Indonesia",
  iran: "Iran (Islamic Republic of)",
  iraq: "Iraq",
  ireland: "Ireland",
  "isle-of-man": "Isle of Man",
  israel: "Israel",
  italy: "Italy",
  jamaica: "Jamaica",
  japan: "Japan",
  jersey: "Jersey",
  jordan: "Jordan",
  kazakhstan: "Kazakhstan",
  kenya: "Kenya",
  kiribati: "Kiribati",
  "north-korea": "Korea (the Democratic People's Republic of)",
  "south-korea": "Korea (the Republic of)",
  kosovo: "Republic of Kosovo",
  kuwait: "Kuwait",
  kyrgyzstan: "Kyrgyzstan",
  laos: "Lao People's Democratic Republic (the)",
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
  marshall: "Marshall Islands (the)",
  martinique: "Martinique",
  mauritania: "Mauritania",
  mauritius: "Mauritius",
  mayotte: "Mayotte",
  mexico: "Mexico",
  micronesia: "Micronesia (Federated States of)",
  moldova: "Moldova (the Republic of)",
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
  netherlands: "Netherlands(the)",
  "new-caledonia": "New Caledonia",
  "new-zealand": "New Zealand",
  nicaragua: "Nicaragua",
  niger: "Niger (the)",
  nigeria: "Nigeria",
  niue: "Niue",
  "norfolk-island": "Norfolk Island",
  "north-macedonia": "North Macedonia",
  "northern-mariana-islands": "Northern Mariana Islands (the)",
  norway: "Norway",
  "oman": "Oman",
  pakistan: "Pakistan",
  palau: "Palau",
  palestine: "Palestine, State of",
  panama: "Panama",
  papua: "Papua New Guinea",
  paraguay: "Paraguay",
  peru: "Peru",
  philippines: "Philippines(the)",
  pitcairn: "Pitcairn",
  poland: "Poland",
  portugal: "Portugal",
  "puerto-rico": "Puerto Rico",
  qatar: "Qatar",
  romania: "Romania",
  russia: "Russian Federation (the)",
  rwanda: "Rwanda",
  reunion: "Réunion",
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
  sudan: "Sudan (the)",
  suriname: "Suriname",
  "svalbard-and-jan-mayen": "Svalbard and Jan Mayen",
  sweden: "Sweden",
  switzerland: "Switzerland",
  syria: "Syrian Arab Republic(the)",
  taiwan: "Taiwan (Province of China)",
  tajikistan: "Tajikistan",
  tanzania: "Tanzania, the United Republic of",
  thailand: "Thailand",
  "timor-leste": "Timor-Leste",
  togo: "Togo",
  tokelau: "Tokelau",
  tonga: "Tonga",
  "trinidad-and-tobago": "Trinidad and Tobago",
  tunisia: "Tunisia",
  turkey: "Turkey",
  turkmenistan: "Turkmenistan",
  "turks-and-caicos-islands": "Turks and Caicos Islands (the)",
  tuvalu: "Tuvalu",
  uganda: "Uganda",
  ukraine: "Ukraine",
  "united-arab-emirates": "United Arab Emirates (the)",
  "united-kingdom": "United Kingdom of Great Britain and Northern Ireland (the)",
  "united-states-minor-outlying-islands": "United States Minor Outlying Islands (the)",
  "united-states-of-america": "United States of America (the)",
  uruguay: "Uruguay",
  uzbekistan: "Uzbekistan",
  vanuatu: "Vanuatu",
  venezuela: "Venezuela (Bolivarian Republic of)",
  vietnam: "Viet Nam",
  "virgin-islands-uk": "Virgin Islands (British)",
  "virgin-islands-us": "Virgin Islands (U.S.)",
  "wallis-and-futuna": "Wallis and Futuna",
  "western-sahara": "Western Sahara*",
  yemen: "Yemen",
  zimbabwe: "Zimbabwe",
} as const

/* https://basarat.gitbook.io/typescript/main-1/defaultisbad
don't export by default! */
const months = {
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

export const constants = {
  contractStatus,
  contractType,
  legalDocumentTypes,
  legalRoles,
  subLicensorRoles,
  licenseStatus,
  distributionRightStatus,
  certifications,
  colors,
  contentType,
  crewRoles,
  directorCategory,
  genres,
  hostedVideoTypes,
  languages,
  medias,
  memberStatus,
  movieCurrencies,
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
  storeType,
  unitBox,
  cartStatus,
  organizationStatus,
  festival,
  months,
  screeningStatus,
  shootingPeriod,
  socialGoals,
  territories,
};


export type Constants = typeof constants;
export type Scope = keyof Constants;
export type GetKeys<S extends Scope> = keyof Constants[S];
export type GetLabel<S extends Scope> = Constants[S][GetKeys<S>]
export type GetCode<S extends Scope> = GetKeys<S> | GetLabel<S>;
export type GetCodeOrNull<S extends Scope, Code> = Code extends GetCode<S> ? GetKeys<S> : null;

/**
 * Returns the value corresponding to a key (ie:code).
 * @dev Codes are used to store sanitized data in database
 * @param scope
 * @param targetValue
 */
export const getValueByKey = (scope: Scope, targetValue: string) => {
  for (const [key, value] of Object.entries(constants[scope])) {
    if (key.toLowerCase() === targetValue.trim().toLowerCase()) {
      return value as GetLabel<Scope>
    }
  }
  return null;
};

/** Check if the given value is a key of a scope */
export const isInKeys = (scope: Scope, givenValue: string) => {
  return (Object.keys(constants[scope])).map((key) => key).includes(givenValue);
}
