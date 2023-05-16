import { algoliaSearchKeyDoc } from '@blockframes/utils/maintenance';
import {
  user,
  org,
  movieOrg,
  orgPermissions,
  movieOrgPermissions,
  movieOrgMoviePermissions,
  displayMovie as movie,
} from '../../fixtures/marketplace/search-display-title';
import { europeanCountries } from '../../fixtures/shared/commons';
import { festival, certifications, IAlgoliaKeyDoc } from '@blockframes/model';
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
  getAllStartingWith,
  //marketplace lib
  selectFilter,
  selectToggle,
  syncMovieToAlgolia,
  escapeKey,
  assertLocalStorage,
} from '@blockframes/testing/cypress/browser';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`orgs/${movieOrg.id}`]: movieOrg,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${movieOrgPermissions.id}`]: movieOrgPermissions,
  [`permissions/${movieOrgPermissions.id}/documentPermissions/${movieOrgMoviePermissions.id}`]: movieOrgMoviePermissions,
  [`movies/${movie.id}`]: movie,
};

const oneTitleSentence = 'There is 1 title available.';

describe('Movie search in marketplace', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    firestore.queryDelete({ collection: 'movies', field: 'orgIds', operator: 'array-contains', value: org.id });
    algolia.deleteMovie({ app: 'catalog', objectId: movie.id });
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('skip-preferences').click();
    get('cookies').click();
    firestore.get(`${algoliaSearchKeyDoc}`).then((config: IAlgoliaKeyDoc) => {
      assertLocalStorage('algoliaSearchKey', config.key);
    });
    assertUrlIncludes('c/o/marketplace/home');
  });

  it('Find with title', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('search-input').type(movie.title.international);
    //wait for the count to update before checking our movie
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
  });

  it('Find with director', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('search-input').type(`${movie.directors[0].firstName} ${movie.directors[0].lastName}`);
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
  });

  it('Find with keyword', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('search-input').type(movie.keywords[0]);
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
  });

  it('Find with filters, save & load filters', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('titles-count');
    selectFilter('Content Type');
    selectToggle('content_', 'Movie');
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
    selectFilter('Release Year');
    get('min-input').type('2020');
    get('max-input').type(movie.release.year.toString());
    get('save-filter').click();
    selectFilter('Running Time');
    get('min-input').type('90');
    get('max-input').type('180');
    get('save-filter').click();
    selectFilter('Festival Selection');
    get(festival[movie.prizes[0].name]).click();
    get('save-filter').click();
    selectFilter('Qualifications');
    get(certifications[movie.certifications[0]]).click();
    get(certifications[movie.certifications[1]]).click();
    get('save-filter').click();
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
    getAllStartingWith('item_').should('have.length', 1);
    // Wait for the last parameter to be present in URL before saving filters
    assertUrlIncludes('%22certifications%22:%5B%22eof%22,%22europeanQualification%22');
    get('save').click();
    get('clear-filters').click();
    get('titles-count').should('not.contain', oneTitleSentence);
    get('load').click();
    get('titles-count').should('contain', oneTitleSentence);
  });

  it('Title is excluded if no match with filters', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('titles-count').should('not.contain', oneTitleSentence);
    get('search-input').type(movie.title.international);
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
    selectFilter('Content Type');
    selectToggle('content_', 'TV');
    get('empty').should('exist');
    get(`movie-card_${movie.id}`).should('not.exist');
    get('clear-filter').click();
    get('save-filter').click();
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
    selectFilter('Genre');
    get('genre').find('input').click();
    get('option_erotic').click();
    get('empty').should('exist');
    get('clear-filter').click();
    get('save-filter').click();
    get(`movie-card_${movie.id}`).should('exist');
    get('titles-count').should('contain', oneTitleSentence);
    selectFilter('Country of Origin');
    get('origin-countries').click();
    get('cayman-islands').click();
    escapeKey();
    get('empty').should('exist');
    get('clear-filter').click();
    get('save-filter').click();
    get(`movie-card_${movie.id}`).should('exist');
    get('titles-count').should('contain', oneTitleSentence);
    selectFilter('Language & Version');
    get('language').find('input').click();
    get('option_belarussian').click();
    check('Dubs');
    get('empty').should('exist');
    get('clear-filter').click();
    get('save-filter').click();
    get(`movie-card_${movie.id}`).should('exist');
    get('titles-count').should('contain', oneTitleSentence);
    selectFilter('Language & Version');
    get('language').find('input').click();
    get(`option_${Object.keys(movie.languages)[0]}`).click();
    check('Subs');
    get('empty').should('exist');
    get('clear-filter').click();
    get('save-filter').click();
    get(`movie-card_${movie.id}`).should('exist');
    get('titles-count').should('contain', oneTitleSentence);
    selectFilter('Release Year');
    get('min-input').type('2030');
    get('empty').should('exist');
    get('clear-filter').click();
    get('save-filter').click();
    get(`movie-card_${movie.id}`).should('exist');
    get('titles-count').should('contain', oneTitleSentence);
    selectFilter('Running Time');
    get('min-input').type('13');
    get('max-input').type('25');
    get('empty').should('exist');
    get(`movie-card_${movie.id}`).should('not.exist');
    get('clear-filter').click();
    get('save-filter').click();
    get(`movie-card_${movie.id}`).should('exist');
  });

  it('Absent if not released', () => {
    firestore.update({ docPath: `movies/${movie.id}`, field: 'app.catalog.status', value: 'draft' });
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('titles-count').then($result => {
      const titlesCount = $result[0].innerText;
      get('search-input').type(movie.title.international);
      get('empty').should('exist');
      get(`movie-card_${movie.id}`).should('not.exist');
      get('clear-filters').click();
      get('titles-count').should('contain', titlesCount);
    });
  });

  it('Can only export less than 450 movies', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    //There shouldn't be less than 450 movies
    get('export').click();
    cy.contains(`Sorry, you can't have an export with that many titles.`);
    get('search-input').type(movie.title.international);
    //wait for the count to update before checking our movie
    get('titles-count').should('contain', oneTitleSentence);
    get(`movie-card_${movie.id}`).should('exist');
    get('export').click();
    cy.contains('Please wait, your export is being generated...');
  });

  it('Can load more movies', () => {
    get('title-link').eq(0).click();
    getAllStartingWith('movie-card_').should('have.length', 50);
    get('load-more').click();
    getAllStartingWith('movie-card_').should('have.length', 100);
  });

  it('Group in Country of Origin filter works properly', () => {
    get('title-link').eq(0).click();
    selectFilter('Country of Origin');
    get('origin-countries').click();
    get('Europe').click();
    escapeKey();
    get('origin-countries').should('contain', 'Europe');
    get('save-filter').click();
    // url should include Europe and not countries of Europe
    europeanCountries.forEach(country => cy.url().should('not.include', country));
    cy.url().should('include', 'Europe');
    get('save').click();
    // clearing filters should remove 'Europe' in filter and european countries in url
    get('clear-filters').click();
    cy.url({ decode: true }).should('include', '"originCountries":[]');
    selectFilter('Country of Origin');
    get('origin-countries').should('contain', '');
    get('save-filter').click();
    // loading filters should bring back 'Europe' in the filter
    get('load').click();
    selectFilter('Country of Origin');
    get('origin-countries').should('contain', 'Europe');
  });
});
