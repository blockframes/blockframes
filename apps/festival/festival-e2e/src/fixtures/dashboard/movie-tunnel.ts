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
};
