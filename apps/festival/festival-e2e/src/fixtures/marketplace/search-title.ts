import { fakeOrgName, fakeUserData, fakeMovieTitle } from '@blockframes/testing/cypress/browser';
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
  createAddressSet,
  createLocation,
  fakeLegalTerms,
  createDocumentMeta,
  MovieSearch,
} from '@blockframes/model';
import { sub } from 'date-fns';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const saleOrgId = '0-e2e-saleOrgId';
const saleOrgName = `${fakeOrgName()}_sale`;
const movieId = '0-e2e-movieId';
const userData = fakeUserData();
const movieTitle = fakeMovieTitle();

export const user = createUser({
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  orgId: orgId,
  termsAndConditions: {
    festival: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
});

export const org = createOrganization({
  id: orgId,
  name: userData.company.name,
  userIds: [adminUid],
  email: userData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
});

export const saleOrg = createOrganization({
  id: saleOrgId,
  name: saleOrgName,
  activity: 'intlSales',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
});

export const orgPermissions = createPermissions({
  id: orgId,
  roles: { [adminUid]: 'superAdmin' },
});

export const saleOrgPermissions = createPermissions({
  id: orgId,
  roles: { [adminUid]: 'superAdmin' },
});

export const moviePermissions = createDocPermissions({
  id: movieId,
  ownerId: orgId,
});

export const displayMovie = createMovie({
  _meta: createDocumentMeta(),
  id: movieId,
  orgIds: [orgId, saleOrgId],
  app: createMovieAppConfig({
    festival: createAppConfig({ status: 'accepted', access: true }),
  }),
  //main
  productionStatus: 'released',
  title: createTitle({
    original: movieTitle,
    international: movieTitle,
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
  originalRelease: [
    {
      country: 'france',
      media: 'festival',
      date: sub(new Date(), { months: 1 }),
    },
  ],
  //technical specification
  format: '1_66',
  formatQuality: '3DHD',
  color: 'colorBW',
  soundFormat: 'dolby-5.1',
  //promotional elements
  promotional: createMoviePromotional({
    videos: createMovieVideos({
      salesPitch: createMovieVideo({ description: 'This is the journey of an E2E test' }),
      otherVideo: createMovieVideo({ title: 'Test promotional video', type: 'teaser' }),
    }),
    notes: [
      createMovieNote({
        firstName: 'Note first',
        lastName: 'Note last',
        role: 'director',
      }),
    ],
  }),
  //prizes & reviews
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
  //versions
  languages: {
    kyrgyz: createMovieLanguageSpecification({ dubbed: true }),
  },
});

export const expectedSavedSearch: { search: Omit<MovieSearch, 'page'> } = {
  search: {
    query: '',
    storeStatus: ['accepted'],
    genres: ['action'],
    originCountries: ['france'],
    languages: {
      languages: ['kyrgyz'],
      versions: {
        original: false,
        dubbed: true,
        subtitle: false,
        caption: false,
      },
    },
    productionStatus: ['released'],
    minBudget: 0,
    releaseYear: { min: 2020, max: displayMovie.release.year },
    sellers: [
      {
        name: saleOrg.name,
        appModule: ['dashboard', 'marketplace'],
        country: saleOrg.addresses.main.country,
        isAccepted: true,
        hasAcceptedMovies: true,
        logo: '',
        activity: saleOrg.activity,
        objectID: saleOrg.id,
      },
    ],
    socialGoals: [],
    contentType: null,
    runningTime: { min: null, max: null },
    hitsPerPage: 50,
    festivals: ['cannes'],
    certifications: ['eof', 'europeanQualification'],
  },
};
