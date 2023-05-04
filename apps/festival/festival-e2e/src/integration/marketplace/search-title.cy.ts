import {
  user,
  org,
  saleOrg,
  orgPermissions,
  saleOrgPermissions,
  moviePermissions,
  displayMovie as movie,
  keywordMovie,
  expectedSavedSearch,
} from '../../fixtures/marketplace/search-title';
import { productionStatus, festival, certifications, User } from '@blockframes/model';
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
  getByClass,
  //marketplace lib
  selectFilter,
  syncMovieToAlgolia,
  snackbarShould,
  escapeKey,
} from '@blockframes/testing/cypress/browser';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`orgs/${saleOrg.id}`]: saleOrg,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${orgPermissions.id}/documentPermissions/${moviePermissions.id}`]: moviePermissions,
  [`permissions/${saleOrgPermissions.id}`]: saleOrgPermissions,
  [`movies/${movie.id}`]: movie,
  [`movies/${keywordMovie.id}`]: keywordMovie,
};

const oneTitleSentence = 'There is 1 title available.';
const twoTitlesSentence = 'There are 2 titles available.';

describe('Movie search in marketplace', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    algolia.deleteMovie({ app: 'festival', objectId: movie.id });
    algolia.deleteMovie({ app: 'festival', objectId: keywordMovie.id });
    algolia.deleteOrg({ app: 'festival', objectId: saleOrg.id });
    firestore.queryDelete({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id });
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    algolia.storeOrganization(saleOrg);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    syncMovieToAlgolia(movie.id);
    syncMovieToAlgolia(keywordMovie.id);
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('cookies').click();
    assertUrlIncludes('c/o/marketplace/home');
  });

  it('Find with filters, save & load filters', () => {
    get('title-link').eq(0).click();
    get('titles-count');
    selectFilter('Sales Agent');
    get('sales-agent').find('input').type(saleOrg.name);
    getByClass('mat-autocomplete-panel').find('mat-option').should('contain', saleOrg.name).click();
    get('save-filter').click();
    selectFilter('Genre');
    get('genre').find('input').click();
    get(`option_${movie.genres[0]}`).click();
    get('save-filter').click();
    selectFilter('Country of Origin');
    get('origin-countries').click();
    get(movie.originCountries[0]).click();
    escapeKey();
    get('save-filter').click();
    selectFilter('Language & Version');
    get('language').find('input').click();
    get(`option_${Object.keys(movie.languages)[0]}`).click();
    check('Dubs');
    get('save-filter').click();
    selectFilter('Production Status');
    get(productionStatus[movie.productionStatus]).click();
    get('save-filter').click();
    //budget is cannot be filtered yet, see issue https://github.com/blockframes/blockframes/issues/8932
    selectFilter('Release Year');
    get('min-input').type('2020');
    get('max-input').type(movie.release.year.toString());
    get('save-filter').click();
    selectFilter('Festival Selection');
    get(festival[movie.prizes[0].name]).click();
    get('save-filter').click();
    selectFilter('Qualifications');
    get(certifications[movie.certifications[0]]).click();
    get(certifications[movie.certifications[1]]).click();
    get('save-filter').click();
    get('titles-count').should('contain', twoTitlesSentence);
    get(`movie-card_${movie.id}`).should('exist');
    // Wait for the last parameter to be present in URL before saving filters
    assertUrlIncludes('%22certifications%22:%5B%22eof%22,%22europeanQualification%22');
    get('save').click();
    snackbarShould('contain', 'Research successfully saved.');
    firestore.get(`users/${user.uid}`).then((user: User) => {
      expect(JSON.parse(user.savedSearches.festival)).to.deep.equal(expectedSavedSearch);
    });
    get('clear-filters').click();
    get('titles-count').should('not.contain', twoTitlesSentence);
    get('load').click();
    get('titles-count').should('contain', twoTitlesSentence);
  });

  it('"Restrict Search" option works as expected', () => {
    get('title-link').eq(0).click();
    get('search-input').type(keywordMovie.keywords[2]);
    // both movie should exist (one has the input value only in the keywords, the other in keywords AND title)
    get('titles-count').should('contain', twoTitlesSentence);
    get(`movie-card_${movie.id}`).should('exist');
    get(`movie-card_${keywordMovie.id}`).should('exist');
    // only one has the input value in its title
    get('search-by').click();
    get('option_title.international').click();
    escapeKey();
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('not.exist');
    get(`movie-card_${keywordMovie.id}`).should('exist');
    // none have the input value in their directors
    get('search-by').click();
    get('option_title.international').click();
    get('option_directors').click();
    escapeKey();
    get('empty').should('exist');
    // both have the input value in their keywords
    get('search-by').click();
    get('option_keywords').click();
    escapeKey();
    get('titles-count').should('contain', twoTitlesSentence);
    get(`movie-card_${movie.id}`).should('exist');
    get(`movie-card_${keywordMovie.id}`).should('exist');
  });

  it('User cannot find a movie if there is a typo in his search', () => {
    get('title-link').eq(0).click();
    get('search-input').type(movie.title.international);
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
    get('search-input').clear().type(movie.title.international.replace('movie', 'movye'));
    get('empty').should('exist');
  });

  it('A search with 2 words should give results containing both', () => {
    get('title-link').eq(0).click();
    get('search-input').type('E2E movie');
    get('titles-count').should('contain', twoTitlesSentence);
    get('search-input').clear().type(`E2E ${movie.title.international.split(' ')[1]}`);
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
  });

  it('Published movie is displayed in org page', () => {
    get('organization-link').click();
    get('search-input').type(saleOrg.name);
    get(`org-card_${saleOrg.id}`).should('exist');
    findIn(`org-card_${saleOrg.id}`, 'logo').click();
    get(`movie-card_${movie.id}`).should('exist');
  });

  it('Unpublished movie is not displayed in org page', () => {
    get('organization-link').click();
    get('search-input').type(saleOrg.name);
    findIn(`org-card_${saleOrg.id}`, 'logo').click();
    get(`movie-card_${movie.id}`).should('exist');
    firestore.update({ docPath: `movies/${movie.id}`, field: 'app.festival.status', value: 'draft' });
    get(`movie-card_${movie.id}`).should('not.exist');
  });
});
