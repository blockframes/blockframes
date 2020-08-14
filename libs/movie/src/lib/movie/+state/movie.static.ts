export const contentType = {
  feature_film: 'Feature Film',
  short: 'Short',
  serie: 'Serie',
  season: 'Season',
  volume: 'Volume',
  episode: 'Episode',
  collection: 'Collection',
  tv_film: 'TV Film',
  flow: 'Flow'
} as const;

export type ContentType = keyof typeof contentType;
export type ContentTypeValue = typeof contentType[ContentType];
