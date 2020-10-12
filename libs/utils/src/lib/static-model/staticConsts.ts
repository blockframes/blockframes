const constants = {
  // -------- //
  // CONTRACT //
  // -------- //
  contractStatus: {
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
  },
  contractType: {
    mandate: 'Mandate',
    sale: 'Sale'
  },
  legalDocumentTypes: {
    chain_of_titles: 'Chain of titles',
    invoices: 'Invoices'
  },
  legalRoles: {
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
  },
  subLicensorRoles: {
    signatory: 'Signatory',
    observator: 'Observator'
  },


  // ------------------ //
  // DISTRIBUTION RIGHT //
  // ------------------ //
  licenseStatus: {
    unknown: 'unknown',
    undernegotiation: 'under negotiation',
    waitingsignature: 'waiting for signature',
    waitingpayment: 'waiting for paiment',
    paid: 'paid'
  },
  distributionRightStatus: {
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
  },


  // ------ //
  // MOVIE  //
  // ------ //
  certifications: {
    artEssai: 'Art & Essai',
    eof: 'EOF',
    awardedFilm: 'Awarded Film',
    aListCast: 'A-list Cast',
    europeanQualification: 'European Qualification'
  },
  colors: {
    c: 'Color',
    b: 'Black & white',
    colorBW: 'Color & Black & White'
  },
  contentType: {
    feature_film: 'Feature Film',
    short: 'Short Film',
    serie: 'Tv Serie',
    season: 'Season',
    volume: 'Volume',
    episode: 'Episode',
    collection: 'Collection',
    tv_film: 'TV Film',
    flow: 'Flow'
  },
  crewRoles: {
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
  },
  directorCategory: {
    firstFeature: 'First Feature',
    risingTalent: 'Rising Talent',
    confirmed: 'Confirmed Director',
    prestige: 'Prestige'
  },
  genres: {
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
  },
  hostedVideoTypes: {
    tailer: 'Trailer',
    teaser: 'Teaser',
    reel: 'Reel',
    clip: 'Clip',
    pitch: 'Pitch',
  },
  // @TODO (#1658) Update LANGUAGES static model to be RFC-5646 compliant
  languages: {
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
  },
  medias: {
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
  },
  memberStatus: {
    confirmed: 'Confirmed',
    looselyAttached: 'Loosely Attached',
    target: 'Target'
  },
  movieCurrencies: {
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
  },
  movieFormat: {
    '1_33': '1.33',
    '1_37': '1.37',
    '1_66': '1.66',
    '1_77': '1.77',
    '1_85': '1.85',
    scope: 'SCOPE',
    '4/3': '4/3',
    '16/9': '16/9'
  },
  movieFormatQuality: {
    sd: 'SD',
    hd: 'HD',
    '2k': '2K',
    '4k': '4K',
    UHD: 'UHD',
    '3D': '3D',
    '3DSD': '3DSD',
    '3DHD': '3DHD',
    '3DUHD': '3DUHD'
  },
  movieLanguageTypes: {
    original: 'Original',
    dubbed: 'Dubbed',
    subtitle: 'Subtitled',
    caption: 'Closed-Captions',
  },
  premiereType: {
    international: 'International',
    world: 'World',
    market: 'Market',
    national: 'National',
  },
  producerRoles: {
    executiveProducer: 'Executive Producer',
    lineProducer: 'Line Producer',
    associateProducer: 'Associate Producer',
    productionManager: 'Production Manager'
  },
  productionStatus: {
    development: 'In development',
    shooting: 'In Production',
    post_production: 'In Post-production',
    finished: 'Completed',
    released: 'Released'
  },
  promotionalElementTypes: {
    trailer: 'Trailer',
    poster: 'Poster',
    banner: 'Banner',
    still_photo: 'Stills',
    presentation_deck: 'Presentation deck',
    scenario: 'Script',
    promo_reel_link: 'Promo reel',
    screener_link: 'Screener',
    trailer_link: 'Trailer',
    teaser_link: 'Teaser'
  },
  rating: {
    pegi: 'PEGI',
    csa: 'CSA',
    cnc: 'CNC'
  },
  scoring: {
    a: 'A',
    b: 'B',
    c: 'C',
    d: 'D'
  },
  screeningStatus: {
    tobedetermined: 'To be determined',
    estimated: 'Estimated',
    confirmed: 'Confirmed'
  },
  shootingPeriod: {
    early: 'Early',
    late: 'Late',
    mid: 'Mid',
  },
  socialGoals: {
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
  },
  soundFormat: {
    mono: 'Mono',
    stereo: 'Stereo',
    dolbySR: 'Dolby SR',
    dts: 'DTS',
    'dolby-5.1': 'Dolby 5.1',
    'dolby-7.1': 'Dolby 7.1',
    thx: 'THX'
  },
  stakeholderRoles: {
    executiveProducer: 'Executive Producer',
    coProducer: 'Co-Producer',
    lineProducer: 'Line Producer',
    distributor: 'Distributor',
    salesAgent: 'Sales Agent',
    laboratory: 'Laboratory',
    financier: 'Financier',
    broadcasterCoproducer: 'Broadcaster coproducer'
  },
  storeStatus: {
    submitted: 'Submitted',
    accepted: 'Accepted',
    draft: 'Draft',
    refused: 'Refused',
  },
  storeType: {
    library: 'Library',
    line_up: 'Line-Up',
  },
  unitBox: {
    usd: 'USD',
    eur: 'EUR',
    admissions: 'Admissions',
  },


  // ------------- //
  // ORGANIZATION  //
  // ------------- //
  cartStatus: {
    pending: 'Pending',
    submitted: 'Submitted',
    accepted: 'Accepted',
    paid: 'Paid'
  },
  orgActivity: {
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
  },
  /** Status of an Organization, set to pending by default when an Organization is created. */
  organizationStatus: {
    pending: 'Pending',
    accepted: 'Accepted'
  },

  // ------------- //
  //   FESTIVALS   //
  // ------------- //
  festival: {
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
  },
  months: {
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
  }
};

export default constants;

export type Constants = typeof constants;
export type Scope = keyof Constants;
export type GetKeys<S extends Scope> = keyof Constants[S];
export type GetLabel<S extends Scope> = Constants[S][GetKeys<S>]
export type GetCode<S extends Scope> = GetKeys<S> | GetLabel<S>;
export type GetCodeOrNull<S extends Scope, Code> = Code extends GetCode<S> ? GetKeys<S> : null;

/**
 * Returns the label corresponding to a key (ie:code).
 * @dev Codes are used to store sanitized data in database
 * @param scope
 * @param targetValue
 */
export const getValueByKey = (scope: Scope, targetValue: string) => {
  for (const [key, value] of Object.entries(constants[scope])) {
    if (key.toLowerCase() === targetValue.trim().toLowerCase()) {
      return value;
    }
  }
  return null;
};

/** Check if the given value is a key of a scope */
export const isInKeys = (scope: Scope, givenValue: string) => {
  return (Object.keys(constants[scope]) as any[]).map(({ key }) => key).includes(givenValue);
}
