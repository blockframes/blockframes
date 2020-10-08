import { App, Module } from '@blockframes/utils/apps';
import { TerritoriesSlug } from '@blockframes/utils/static-model';

// TODO extract that (along with other potential common features) into an algolia file
export interface AlgoliaSearch {
  query: string;
  page: number;
}

interface AlgoliaRecord {
  objectID: string,
}
export interface AlgoliaRecordOrganization extends AlgoliaRecord {
  name: string,
  appAccess: App[],
  appModule: Module[],
  country: TerritoriesSlug
}

export interface AlgoliaRecordMovie extends AlgoliaRecord {
  title: {
    international: string,
    original: string,
  },
  directors: string[],
  keywords: string[],
  genres: string[],
  originCountries: string[],
  languages: {
    original: string[],
    dubbed: string[],
    subtitle: string[],
    caption: string[],
  },
  status: string,
  storeConfig: string,
  budget: number,
  orgName: string,
  storeType: string,
  appAccess: App[],
}

export interface AlgoliaRecordUser extends AlgoliaRecord {
  email: string,
  firstName: string,
  lastName: string,
  /** this is just a direct url to an image and **NOT** an `ImgRef` */
  avatar: string,
}
