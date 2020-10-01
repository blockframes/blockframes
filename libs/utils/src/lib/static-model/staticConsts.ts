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
  hostedVideoTypes: {
    tailer: 'Trailer',
    teaser: 'Teaser',
    reel: 'Reel',
    clip: 'Clip',
    pitch: 'Pitch',
  },
  memberStatus: {
    confirmed: 'Confirmed',
    looselyAttached: 'Loosely Attached',
    target: 'Target'
  },
  movieLanguageTypes: {
    original: 'Original',
    dubbed: 'Dubbed',
    subtitle: 'Subtitle',
    caption: 'Caption',
  },
  premiereType: {
    international: 'International',
    world: 'World',
    market: 'Market',
    national: 'National',
  },
  productionStatus: {
    development: 'In development',
    shooting: 'In Production',
    post_production: 'In Post-production',
    finished: 'Completed',
    released: 'Released'
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
  // FESTIVALS  //
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
