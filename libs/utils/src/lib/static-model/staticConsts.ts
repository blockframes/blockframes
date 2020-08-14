const constants = {
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
  }
};

export default constants;


export type ContentType = keyof typeof constants.contentType;
export type ContentTypeValue = typeof constants.contentType[ContentType];

export type StoreType = keyof typeof constants.storeType;
export type StoreTypeValue = typeof constants.storeType[StoreType];

export type PremiereType = keyof typeof constants.premiereType;
export type PremiereTypeValue = typeof constants.premiereType[PremiereType];

export type UnitBox = keyof typeof constants.unitBox;
export type UnitBoxValue = typeof constants.unitBox[UnitBox];

export type StoreStatus = keyof typeof constants.storeStatus;
export type StoreStatusValue = typeof constants.storeStatus[StoreStatus];

export type MovieLanguageTypes = keyof typeof constants.movieLanguageTypes;
export type MovieLanguageTypesValue = typeof constants.movieLanguageTypes[MovieLanguageTypes];
