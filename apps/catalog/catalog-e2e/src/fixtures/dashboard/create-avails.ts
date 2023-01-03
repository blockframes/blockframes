import { fakeUserData } from '@blockframes/testing/cypress/browser';
import {
  createMovie,
  createDocPermissions,
  createPermissions,
  createMovieAppConfig,
  createAppConfig,
  createTitle,
  createUser,
  createOrganization,
  createOrgAppAccess,
  fakeLegalTerms,
  Contract,
  Term,
  territoriesGroup,
} from '@blockframes/model';

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
    catalog: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
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

export const acceptedMovie = createMovie({
  id: movieId,
  orgIds: [orgId],
  app: createMovieAppConfig({
    catalog: createAppConfig({ status: 'accepted', access: true }),
  }),
  //main
  productionStatus: 'released',
  title: createTitle({
    original: 'Original title',
    international: 'International title',
  }),
});

export const expectedContract: Partial<Contract> = {
  titleId: '0-e2e-movieId',
  sellerId: '0-e2e-orgId',
  type: 'mandate',
  status: 'accepted',
  parentTermId: '',
  buyerUserId: '',
};

export const expectedTerm = {
  territories: [
    //all territories in Europe and Latin America, plus Nepal
    territoriesGroup.map(group => (group.label === 'Europe' || group.label === 'Latin America') && group.items).filter(Boolean),
    'nepal',
  ].flat(2),
  medias: ['payTv', 'freeTv', 'payPerView', 'rental', 'festival'],
  languages: {
    english: {
      dubbed: true,
      subtitle: false,
      caption: false,
    },
    french: {
      dubbed: false,
      subtitle: true,
      caption: false,
    },
  },
  licensedOriginal: true,
  criteria: [],
  exclusive: false,
  /* Dates will be checked with the UI in another test, because below format is received using the plugin to read firestore #9047
    duration: {
        from: {
            _seconds: 1704063600,
            _nanoseconds: 0
        },
        to: {
            _seconds: 1733958000,
            _nanoseconds: 0
        }
    },
    */
};
