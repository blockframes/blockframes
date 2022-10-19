import {
  user,
  org,
  saleOrg,
  orgPermissions,
  saleOrgPermissions,
  moviePermissions,
  displayMovie as movie,
  expectedSavedLocalStorage,
} from '../../fixtures/marketplace/display-title';
import { genres, languages, territories, productionStatus, festival, certifications } from '@blockframes/model';
import {
  // plugins
  adminAuth,
  algolia,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  assertUrlIncludes,
  check,
  get,
  findIn,
  getInListbox,
  getByClass,
  //marketplace lib
  movieCardShould,
  selectFilter,
  selectYear,
  syncMovieToAlgolia,
} from '@blockframes/testing/cypress/browser';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`orgs/${saleOrg.id}`]: saleOrg,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${orgPermissions.id}/documentPermissions/${moviePermissions.id}`]: moviePermissions,
  [`permissions/${saleOrgPermissions.id}`]: saleOrgPermissions,
  [`movies/${movie.id}`]: movie,
};

describe('Movie display in marketplace', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    algolia.deleteOrg({ app: 'festival', objectId: saleOrg.id });
    algolia.deleteMovie({ app: 'festival', objectId: movie.id });
    firestore.deleteOrgMovies(org.id);
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    algolia.storeOrganization(saleOrg);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('skip-preferences').click();
    get('cookies').click();
    assertUrlIncludes('c/o/marketplace/home');
  });

  it('Find with filters, save & load filters', () => {
    syncMovieToAlgolia(movie.id);
    findIn('New on Archipel', 'see-all').click();
    get('titles-count');
    selectFilter('Sales Agent');
    get('sales-agent').find('input').type(saleOrg.name);
    getByClass('mat-autocomplete-panel').find('mat-option').should('contain', saleOrg.name).click();
    get('save-filter').click();
    selectFilter('Genre');
    get('genre').find('input').click();
    getInListbox(genres[movie.genres[0]]);
    get('save-filter').click();
    selectFilter('Country of Origin');
    get('country').find('input').click();
    getInListbox(territories[movie.originCountries[0]]);
    get('save-filter').click();
    selectFilter('Language & Version');
    get('language').find('input').click();
    getInListbox(languages[Object.keys(movie.languages)[0]]);
    check('Dubs');
    get('save-filter').click();
    selectFilter('Production Status');
    get(productionStatus[movie.productionStatus]).click();
    get('save-filter').click();
    //budget is cannot be filtered yet, see issue https://github.com/blockframes/blockframes/issues/8932
    selectFilter('Release Year');
    get('slider').focus();
    selectYear(movie.release.year - (movie.release.year % 10));
    get('slider').find('.mat-slider-thumb-label').should('contain', '2020');
    get('save-filter').click();
    selectFilter('Festival Selection');
    get(festival[movie.prizes[0].name]).click();
    get('save-filter').click();
    selectFilter('Qualifications');
    get(certifications[movie.certifications[0]]).click();
    get(certifications[movie.certifications[1]]).click();
    get('save-filter').click();
    get('titles-count').should('contain', 'There is 1 title available.');
    movieCardShould('exist', movie.title.international);
    //without wait, Cypress goes to quick and some filters are not saved in the localStorage
    cy.wait(1000);
    get('save').click();
    cy.window().then(window => {
      expect(JSON.parse(window.localStorage.getItem('festival-saved-search'))).to.deep.equal(expectedSavedLocalStorage);
    });
    get('clear-filters').click();
    get('titles-count').should('not.contain', 'There is 1 title available.');
    get('load').click();
    get('titles-count').should('contain', 'There is 1 title available.');
  });
});
