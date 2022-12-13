import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  findIn,
  assertUrlIncludes,
  snackbarShould,
} from '@blockframes/testing/cypress/browser';
import { user, org, orgPermissions, moviePermissions, acceptedMovie as movie } from '../../fixtures/dashboard/create-avails';

const today = new Date();
const nextYear = today.getFullYear() + 1;

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${orgPermissions.id}/documentPermissions/${moviePermissions.id}`]: moviePermissions,
  [`movies/${movie.id}`]: movie,
};

describe('Movie tunnel', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    firestore.deleteContractsAndTerms(org.id);
    firestore.deleteOrgMovies(org.id);
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('cookies').click();
  });

  it('Edit an existing movie', () => {
    get('avails').click();
    get('add').click();
    get('title-select').click();
    get(`title_${movie.id}`).should('contain', movie.title.international).and('contain', '(Accepted)').click();
    get('next').click();
    assertUrlIncludes(`c/o/dashboard/avails/select/${movie.id}/manage`);
    get('territories').click();
    get('Europe').click();
    get('Latin America').click();
    get('nepal').click();
    cy.get('body').type('{esc}');
    get('territories').should('contain', 'Europe').and('contain', 'Latin America').and('contain', 'Nepal');
    get('medias').click();
    get('TV').click();
    get('Festivals').click();
    get('rental').click();
    cy.get('body').type('{esc}');
    get('medias').should('contain', 'TV').and('contain', 'Festivals').and('contain', 'Rental');
    get('dateFrom').clear().type(`01/01/${nextYear}`);
    get('dateTo').clear().type(`12/12/${nextYear}`);
    get('exclusivity').click();
    get('non-exclusive').click();
    get('add-version').click();
    get('languages').find('input').type('fr');
    get('option_french').click();
    get('save-language').click();
    findIn('french', 'subtitle').click();
    get('add-version').click();
    get('languages').find('input').click();
    get('option_english').click();
    get('save-language').click();
    findIn('english', 'dubbed').click();
    get('table-save').click();
    get('save').click();
    snackbarShould('contain', '1 Term(s) created.');
  });
});
