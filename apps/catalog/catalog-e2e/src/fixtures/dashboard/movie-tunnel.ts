import { fakeUserData } from '@blockframes/testing/cypress/browser';
import {
  createMovie,
  createDocPermissions,
  createPermissions,
  createMovieAppConfig,
  createAudienceGoals,
  createAppConfig,
  createMoviePromotional,
  createMovieNote,
  createMovieVideos,
  createMovieVideo,
  createReleaseYear,
  createMovieStakeholders,
  createTitle,
  createUser,
  createOrganization,
  createOrgAppAccess,
  createMovieLanguageSpecification,
  legalTerms,
} from '@blockframes/model';
import { sub } from 'date-fns';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const movieId = '0-e2e-movieId';
const userData = fakeUserData();

export const user = createUser({
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  orgId: orgId,
  termsAndConditions: {
    catalog: legalTerms,
  },
  privacyPolicy: legalTerms,
});

export const org = createOrganization({
  id: orgId,
  name: userData.company.name,
  userIds: [adminUid],
  email: userData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ catalog: { marketplace: true, dashboard: true } }),
});

export const orgPermissions = createPermissions({
  id: orgId,
  roles: { [adminUid]: 'superAdmin' },
});

export const moviePermissions = createDocPermissions({
  id: movieId,
  ownerId: orgId,
});

export const inDevelopmentMovie = createMovie({
  id: movieId,
  orgIds: [orgId],
  app: createMovieAppConfig({
    catalog: createAppConfig({ status: 'draft', access: true }),
  }),
  //main
  productionStatus: 'development',
  title: createTitle({
    original: 'Original title',
    international: 'International title',
  }),
  internalRef: 'E2E ref',
  runningTime: {
    time: 120,
    status: 'tobedetermined',
  },
  release: createReleaseYear({
    year: new Date().getFullYear() + 1,
    status: 'estimated',
  }),
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
  stakeholders: createMovieStakeholders({
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
  }),
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
      lastName: 'One',
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
  estimatedBudget: 50000000,
  audience: createAudienceGoals({
    targets: ['E2E tests', 'reliability'],
    goals: ['sanitation', 'industry'],
  }),
  //technical specification
  format: '1_66',
  formatQuality: '3DHD',
  color: 'colorBW',
  soundFormat: 'dolby-5.1',
  //promotional elements
  promotional: createMoviePromotional({
    videos: createMovieVideos({
      salesPitch: createMovieVideo({ description: 'This is the journey of an E2E test' }),
      otherVideos: [createMovieVideo({ title: 'Test other videos', type: 'teaser' })],
    }),
    notes: [
      createMovieNote({
        firstName: 'Note first',
        lastName: 'Note last',
        role: 'director',
      }),
    ],
  }),
});

export const update = createMovie({
  prizes: [
    {
      name: 'cannes',
      prize: `Palme d'Or`,
      year: 2022,
      premiere: 'world',
    },
  ],
  customPrizes: [
    {
      name: 'Custom festival',
      prize: 'Custom Prize',
      year: 2021,
      premiere: 'market',
    },
  ],
  review: [
    {
      criticName: 'Joe Criticizer',
      journalName: 'Critics&Co',
      revueLink: 'http://www.criticandco.com/e2e',
      criticQuote: 'This is the best e2e fake movie !',
    },
  ],
  originalRelease: [
    {
      country: 'france',
      media: 'festival',
      date: sub(new Date(), { months: 1 }),
    },
  ],
  boxOffice: [
    {
      territory: 'france',
      unit: 'eur',
      value: 1000000,
    },
  ],
  rating: [
    {
      country: 'france',
      value: 'imdb : 8.2',
    },
  ],
  certifications: ['eof', 'europeanQualification'],
  format: '4/3',
  formatQuality: '4k',
  color: 'c',
  soundFormat: 'thx',
  languages: {
    spanish: createMovieLanguageSpecification({ subtitle: true }),
  },
});
