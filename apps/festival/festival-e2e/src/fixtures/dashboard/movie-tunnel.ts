import { e2eUser, e2eOrg, e2ePermissions, fakeUserData } from '@blockframes/testing/cypress/browser';
import { Movie } from '@blockframes/model';

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

export const inDevelopmentMovie: Partial<Movie> = {
  //main
  productionStatus: 'development',
  title: { original: 'Test movie' },
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
          year: 2020
        },
        {
          title: 'His second acting',
          year: 2021
        },
      ]
    },
    {
      firstName: 'Actor',
      lastName: ' Two',
      status: 'looselyAttached',
      description: 'Second actor',
      filmography: [
        {
          title: 'His 55th acting',
          year: 2020
        },
        {
          title: 'His 56th acting',
          year: 2021
        },
      ]
    }
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
          year: 2020
        },
        {
          title: 'His second movie',
          year: 2021
        },
      ]
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
          year: 2020
        },
        {
          title: 'His 56th movie',
          year: 2021
        },
      ]
    }
  ]
};
