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
    short: 'Short',
    serie: 'Serie',
    season: 'Season',
    volume: 'Volume',
    episode: 'Episode',
    collection: 'Collection',
    tv_film: 'TV Film',
    flow: 'Flow'
  },
  storeType: {
    library: 'Library',
    line_up: 'Line-Up',
  },
  premiereType: {
    international: 'International',
    world: 'World',
    market: 'Market',
    national: 'National',
  },
  unitBox: {
    boxoffice_dollar: 'Box Office in $',
    boxoffice_euro: 'Box Office in €',
    admissions: 'Admissions',
  },
  storeStatus: {
    submitted: 'Submitted',
    accepted: 'Accepted',
    draft: 'Draft',
    refused: 'Refused',
  },
  movieLanguageTypes: {
    original: 'Original',
    dubbed: 'Dubbed',
    subtitle: 'Subtitle',
    caption: 'Caption',
  },

};

export default constants;
