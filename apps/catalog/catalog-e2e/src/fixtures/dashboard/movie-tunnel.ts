import { e2eUser, e2eOrg, e2eOrgPermissions, e2eMoviePermissions, fakeUserData } from '@blockframes/testing/cypress/browser';
import { Movie } from '@blockframes/model';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const movieId = '0-e2e-movieId';
const userData = fakeUserData();

export const user = e2eUser({
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  app: 'catalog',
  orgId: orgId,
});

export const org = e2eOrg({
  id: orgId,
  name: userData.company.name,
  userIds: [adminUid],
  email: userData.email,
  app: 'catalog',
  dashboardAccess: true,
});

export const orgPermissions = e2eOrgPermissions({
  orgId,
  adminUid,
});

export const moviePermissions = e2eMoviePermissions({
  movieId,
  orgId,
});

export const inDevelopmentMovie: Partial<Movie> = {
  id: movieId,
  orgIds: [orgId],
  _type: 'movies',
  contentType: 'movie',
  app: {
    financiers: {
      access: false,
      refusedAt: null,
      acceptedAt: null,
      status: 'draft',
    },
    catalog: {
      access: true,
      refusedAt: null,
      acceptedAt: null,
      status: 'draft',
    },
    festival: {
      access: false,
      refusedAt: null,
      acceptedAt: null,
      status: 'draft',
    },
  },
  //main
  productionStatus: 'development',
  title: {
    original: 'Original title',
    international: 'International title',
  },
  internalRef: 'E2E ref',
  runningTime: {
    time: 120,
    status: 'tobedetermined',
  },
  release: {
    year: new Date().getFullYear() + 1,
    status: 'estimated',
  },
  originCountries: ['france', 'united-kingdom'],
  originalLanguages: ['french', 'english'],
  genres: ['action', 'romance'],
  directors: [
    {
      firstName: 'John',
      lastName: 'Doe',
      category: 'risingTalent',
      status: 'looselyAttached',
      description: 'E2E description',
      filmography: [
        {
          title: 'Past movie',
          year: 2000,
        },
      ],
    },
  ],
  //storyline
  logline: 'A random character in a movie',
  synopsis: 'We follow the life of a random character',
  keyAssets: 'Filmed with a phone',
  keywords: ['random', 'phone'],
  //production information
  stakeholders: {
    productionCompany: [
      {
        displayName: 'mainProd',
        countries: ['france', 'united-kingdom'],
      },
      {
        displayName: 'otherProd',
        countries: ['france', 'united-kingdom'],
      },
    ],
    coProductionCompany: [
      {
        displayName: 'coProd',
        countries: ['belgium'],
      },
    ],
    broadcasterCoproducer: [],
    distributor: [
      {
        displayName: 'distribOrg',
        countries: ['france'],
      },
    ],
    salesAgent: [
      {
        displayName: 'saleOrg',
        countries: ['france'],
      },
    ],
    lineProducer: [],
    laboratory: [],
    financier: [],
  },
  producers: [
    {
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'executiveProducer',
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      role: 'associateProducer',
    },
  ],
  //artistic team
  cast: [
    {
      firstName: 'Actor',
      lastName: ' One',
      status: 'confirmed',
      description: 'First actor',
      filmography: [
        {
          title: 'His first acting',
          year: 2020,
        },
        {
          title: 'His second acting',
          year: 2021,
        },
      ],
    },
    {
      firstName: 'Actor',
      lastName: ' Two',
      status: 'looselyAttached',
      description: 'Second actor',
      filmography: [
        {
          title: 'His 55th acting',
          year: 2020,
        },
        {
          title: 'His 56th acting',
          year: 2021,
        },
      ],
    },
  ],
  crew: [
    {
      role: 'dialogueWriter',
      firstName: 'Young',
      lastName: ' Writer',
      status: 'confirmed',
      description: 'Young is promising',
      filmography: [
        {
          title: 'His first movie',
          year: 2020,
        },
        {
          title: 'His second movie',
          year: 2021,
        },
      ],
    },
    {
      role: 'castingDirector',
      firstName: 'Old',
      lastName: ' Caster',
      status: 'looselyAttached',
      description: 'Old is promising',
      filmography: [
        {
          title: 'His 55th movie',
          year: 2020,
        },
        {
          title: 'His 56th movie',
          year: 2021,
        },
      ],
    },
  ],
  //additional information
  estimatedBudget: '50000000',
  audience: {
    targets: ['E2E tests', 'reliability'],
    goals: ['sanitation', 'industry'],
  },
  //shooting information
  shooting: {
    dates: {
      planned: {
        from: {
          period: 'early',
          month: new Date().toLocaleDateString('en-US', { month: 'long' }),
          year: new Date().getFullYear() + 1,
        },
        to: {
          period: 'early',
          month: new Date().toLocaleDateString('en-US', { month: 'long' }),
          year: new Date().getFullYear() + 2,
        },
      },
    },
    locations: [
      {
        country: 'france',
        cities: ['Lyon', 'Nantes'],
      },
      {
        country: 'united-kingdom',
        cities: ['London', 'Manchester'],
      },
    ],
  },
  expectedPremiere: {
    date: new Date(new Date().getFullYear() + 2, 0, 1),
    event: 'E2E summit',
  },
  //technical specification
  format: '1_66',
  formatQuality: '3DHD',
  color: 'colorBW',
  soundFormat: 'dolby-5.1',
  //promotional elements
  promotional: {
    videos: {
      salesPitch: {
        description: 'This is the journey of an E2E test',
        jwPlayerId: null,
        privacy: null,
        collection: null,
        docId: null,
        field: null,
        storagePath: null,
      },
      otherVideos: [
        {
          title: 'Test other videos',
          type: 'teaser',
          jwPlayerId: null,
          privacy: null,
          collection: null,
          docId: null,
          field: null,
          storagePath: null,
        },
      ],
    },
    moodboard: null,
    notes: [
      {
        firstName: 'Note first',
        lastName: 'Note last',
        role: 'director',
        privacy: null,
        collection: null,
        docId: null,
        field: null,
        storagePath: null,
      },
    ],
    presentation_deck: null,
    scenario: null,
    still_photo: null,
  },
};
