import { e2eUser, e2eOrg, e2ePermissions, fakeUserData } from '@blockframes/testing/cypress/browser';
import { Organization, User, createMovie, EventTypes } from '@blockframes/model';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const userData = fakeUserData();

export const user = e2eUser({
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  orgId: orgId,
});

export const org = e2eOrg({
  id: orgId,
  name: userData.company.name,
  userIds: [adminUid],
  email: userData.email,
  dashboardAccess: false,
});

export const permissions = e2ePermissions({
  id: orgId,
  adminUid: adminUid,
});

export const movies = createMovie({
  id: '0-e2e-movie1',
})
/*
  // Every field concerning the document
  _type: 'movies';
  _meta?: DocumentMeta<D>;
  id: string;

  // Only section left
  promotional: MoviePromotionalElements;

  // Every field concerning the movie
  app: Partial<{ [app in App]: MovieAppConfig<D> }>; //! required
  audience?: MovieGoalsAudience;
  banner?: StorageFile;
  boxOffice?: BoxOffice[];
  cast?: Cast[];
  certifications?: Certification[];
  color?: Color;
  contentType: ContentType; //! required
  crew?: Crew[];
  directors: Director[]; //! required
  estimatedBudget?: NumberRange;
  expectedPremiere?: MovieExpectedPremiereRaw<D>;
  format?: MovieFormat;
  formatQuality?: MovieFormatQuality;
  genres: Genre[]; //! required
  customGenres?: string[];
  internalRef?: string;
  isOriginalVersionAvailable: boolean;
  keyAssets?: string;
  keywords?: string[];
  languages?: LanguageRecord;
  logline?: string;
  originalLanguages: Language[]; //! required
  originalRelease?: MovieOriginalReleaseRaw<D>[];
  originCountries: Territory[]; //! required
  poster?: StorageFile;
  prizes?: Prize[];
  customPrizes?: Prize[];
  producers?: Producer[];
  productionStatus?: ProductionStatus;
  rating?: MovieRating[];
  release: MovieRelease; //! required
  review?: MovieReview[];
  runningTime?: MovieRunningTime;
  scoring?: Scoring;
  shooting?: MovieShooting;
  soundFormat?: SoundFormat;
  stakeholders?: MovieStakeholders;
  synopsis: string; //! required
  title: Title; //! required
  orgIds: string[]; //! required
  campaignStarted: D;

  //CATALOG specific
  delivery?: {
    file: StorageFile;
  };
  */