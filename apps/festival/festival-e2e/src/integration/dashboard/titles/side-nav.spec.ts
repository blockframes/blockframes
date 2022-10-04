import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  checkMovieTunnelSideNav,
} from '@blockframes/testing/cypress/browser';
import { Movie, productionStatus } from '@blockframes/model';
import { user, org, permissions } from '../../../fixtures/dashboard/movie-tunnel';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${permissions.id}`]: permissions,
};

describe('Movie tunnel', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    firestore.deleteOrgMovies(org.id);
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('title').click();
    get('cookies').click();
    get('add-title').click();
    get('start').click();
  });

  it('Checks side nav for movie in development', () => {
    get('status_0').should('contain', productionStatus['development']).click();
    get('next').click();
    checkMovieTunnelSideNav('development');
  });
  it('Checks side nav for a movie in production', () => {
    get('status_1').should('contain', productionStatus['shooting']).click();
    get('next').click();
    checkMovieTunnelSideNav('shooting');
  });
  it('Checks side nav for a movie in post production', () => {
    get('status_2').should('contain', productionStatus['post_production']).click();
    get('next').click();
    checkMovieTunnelSideNav('post_production');
  });
  it('Checks side nav for a finished movie', () => {
    get('status_3').should('contain', productionStatus['finished']).click();
    get('next').click();
    checkMovieTunnelSideNav('finished');
  });
  it('Checks side nav for a released movie', () => {
    get('status_4').should('contain', productionStatus['released']).click();
    get('next').click();
    checkMovieTunnelSideNav('released');
  });
});
