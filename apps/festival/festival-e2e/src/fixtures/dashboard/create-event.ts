import { e2eUser, e2eOrg, e2ePermissions, fakeUserData } from '@blockframes/testing/cypress/browser';
import { Organization, User, createMovie, Movie, EventTypes } from '@blockframes/model';

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
  dashboardAccess: true,
});

export const permissions = e2ePermissions({
  id: orgId,
  adminUid: adminUid,
});

export const movie2: Movie = createMovie({
  id: '0-e2e-movie2',
  _type: 'movies',
  // Mandatory fields
  contentType: 'movie',
  directors: [],
  genres: [],
  originalLanguages: [],
  originCountries: [],
  synopsis: 'This is a movie for e2e tests',
  orgIds: [orgId],
  title: {
    original: 'Movie test2',
    international: 'Movie test2',
  },
  app: {
    festival: {
      access: true,
      refusedAt: null,
      acceptedAt: new Date(),
      status: 'accepted',
    },
  },
});

export const movie1: Movie = {
  keywords: [],
  release: {
    year: 2022,
    status: 'estimated',
  },
  rating: [],
  shooting: {
    dates: {
      planned: {},
    },
    locations: [],
  },
  estimatedBudget: null,
  _meta: {
    updatedBy: 'adminUid',
    createdAt: new Date(),
    createdBy: 'adminUid',
    updatedAt: new Date(),
  },
  cast: [
    {
      lastName: 'Williamson',
      firstName: 'Fred',
      status: 'confirmed',
    },
    {
      lastName: 'Möller',
      firstName: 'Mike',
    },
    {
      lastName: 'Lamas',
      firstName: 'Lorenzo',
    },
  ],
  review: [],
  productionStatus: 'finished',
  id: '0-e2e-movie1',
  contentType: 'movie',
  promotional: {
    notes: [],
    presentation_deck: {
      docId: '',
      privacy: 'public',
      storagePath: '',
      collection: 'movies',
      field: '',
    },
    videos: {
      salesPitch: {
        docId: '',
        privacy: 'public',
        storagePath: '',
        collection: 'movies',
        field: '',
        jwPlayerId: '',
      },
      screener: {
        docId: '',
        privacy: 'public',
        storagePath: '',
        collection: 'movies',
        field: '',
        jwPlayerId: 'YlSFNnkR',
      },
      otherVideos: [],
    },
    scenario: {
      docId: '',
      privacy: 'public',
      storagePath: '',
      collection: 'movies',
      field: '',
    },
    still_photo: [],
    moodboard: {
      docId: '',
      privacy: 'public',
      storagePath: '',
      collection: 'movies',
      field: '',
    },
  },
  app: {
    financiers: {
      access: false,
      refusedAt: null,
      status: 'draft',
      acceptedAt: null,
    },
    festival: {
      access: true,
      refusedAt: null,
      acceptedAt: new Date(),
      status: 'accepted',
    },
    catalog: {
      access: false,
      refusedAt: null,
      acceptedAt: null,
      status: 'draft',
    },
  },
  audience: {
    targets: [null],
    goals: [null],
  },
  originCountries: ['germany', 'united-states-of-america'],
  format: null,
  runningTime: {
    time: 85,
    status: 'confirmed',
  },
  customPrizes: [],
  originalLanguages: ['english', 'german'],
  soundFormat: null,
  prizes: [],
  boxOffice: [],
  poster: {
    docId: '',
    privacy: 'public',
    storagePath: '',
    collection: 'movies',
    field: '',
  },
  isOriginalVersionAvailable: null,
  color: null,
  directors: [
    {
      lastName: 'Sentner',
      firstName: 'Nico',
    },
  ],
  expectedPremiere: {
    date: null,
    event: '',
  },
  campaignStarted: null,
  stakeholders: {
    broadcasterCoproducer: [],
    financier: [],
    productionCompany: [],
    distributor: [],
    coProductionCompany: [],
    laboratory: [],
    lineProducer: [],
    salesAgent: [],
  },
  title: {
    original: 'Movie test',
    international: 'Movie test',
  },
  crew: [],
  logline: '',
  orgIds: [orgId],
  originalRelease: [],
  genres: ['thriller'],
  formatQuality: null,
  scoring: null,
  languages: {
    german: {
      caption: false,
      dubbed: false,
      subtitle: true,
    },
    english: {
      caption: false,
      dubbed: false,
      subtitle: true,
    },
  },
  _type: 'movies',
  banner: {
    docId: '',
    privacy: 'public',
    storagePath: '',
    collection: 'movies',
    field: '',
  },
  synopsis:
    'Trapped inside an old mining complex, among the ruins of Chernobyl, a group of international mercenaries must band together to take their last stand.',
  certifications: [],
  customGenres: [],
  producers: [],
  internalRef: '',
  keyAssets: '',
};
