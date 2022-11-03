import {
  user,
  org,
  movieOrg,
  orgPermissions,
  movieOrgPermissions,
  movieOrgMoviePermissions,
  displayMovie as movie,
} from '../../fixtures/marketplace/display-title';
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
  selectYear,
  syncMovieToAlgolia,
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

let titlesCount: string;

describe('Movie display in marketplace', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    algolia.deleteMovie({ app: 'catalog', objectId: movie.id });
    firestore.deleteOrgMovies(org.id);
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
    assertUrlIncludes('c/o/marketplace/home');
  });

  it('Find with title', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('titles-count').then($result => {
      titlesCount = $result[0].innerText;
      get('search-input').type(movie.title.international);
      //wait for the count to update before checking our movie
      get('titles-count').should('not.contain', titlesCount);
      get(`movie-card_${movie.id}`).should('exist');
    });
  });

  it('Find with director', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('titles-count').then($result => {
      titlesCount = $result[0].innerText;
      get('search-input').type(`${movie.directors[0].firstName} ${movie.directors[0].lastName}`);
      get('titles-count').should('not.contain', titlesCount);
      get(`movie-card_${movie.id}`).should('exist');
    });
  });

  it('Find with keyword', () => {
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('titles-count').then($result => {
      titlesCount = $result[0].innerText;
      get('search-input').type(movie.keywords[0]);
      get('titles-count').should('not.contain', titlesCount);
      get(`movie-card_${movie.id}`).should('exist');
    });
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
    get('country').find('input').click();
    get(`option_${movie.originCountries[0]}`).click();
    get('save-filter').click();
    selectFilter('Language & Version');
    get('language').find('input').click();
    get(`option_${Object.keys(movie.languages)[0]}`).click();
    check('Dubs');
    get('save-filter').click();
    selectFilter('Release Year');
    get('slider').focus();
    selectYear(movie.release.year - (movie.release.year % 10));
    get('slider').find('.mat-slider-thumb-label').should('contain', '2020');
    get('save-filter').click();
    selectFilter('Running Time');
    get('90min - 180min').click();
    get('save-filter').click();
    get('titles-count').should('contain', 'There is 1 title available.');
    get(`movie-card_${movie.id}`).should('exist');
    getAllStartingWith('item_').should('have.length', 1);
    get('save').click();
    get('clear-filters').click();
    get('titles-count').should('not.contain', 'There is 1 title available.');
    get('load').click();
    get('titles-count').should('contain', 'There is 1 title available.');
  });

  it('Title is excluded if no match with filters', () => {
    //test failing = database changed
    //explanation: Cypress does not allow conditional testing.
    //after applying a filter, we might still have movies, OR nothing.
    //other solution, know the filtered Algolia movies beforehand.
    //other solution, inject a dummy movie corresponding to each tested filter.
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('titles-count').then($result => {
      titlesCount = $result[0].innerText;
      get('search-input').type(movie.title.international);
      get('titles-count').should('not.contain', titlesCount);
      get(`movie-card_${movie.id}`).should('exist');
      get('titles-count').then($result => {
        titlesCount = $result[0].innerText;
        selectFilter('Content Type');
        selectToggle('content_', 'TV');
        get('titles-count').should('not.contain', titlesCount);
        get(`movie-card_${movie.id}`).should('not.exist');
        get('clear-filter').click();
        get('save-filter').click();
        get('titles-count').should('contain', titlesCount);
        get(`movie-card_${movie.id}`).should('exist');
        selectFilter('Genre');
        get('genre').find('input').click();
        get('option_erotic').click();
        get('empty').should('exist');
        get('clear-filter').click();
        get('save-filter').click();
        get(`movie-card_${movie.id}`).should('exist');
        get('titles-count').should('contain', titlesCount);
        selectFilter('Country of Origin');
        get('country').find('input').click();
        get('option_cayman-islands').click();
        get('empty').should('exist');
        get('clear-filter').click();
        get('save-filter').click();
        get(`movie-card_${movie.id}`).should('exist');
        get('titles-count').should('contain', titlesCount);
        selectFilter('Language & Version');
        get('language').find('input').click();
        get('option_belarussian').click();
        check('Dubs');
        get('empty').should('exist');
        get('clear-filter').click();
        get('save-filter').click();
        get(`movie-card_${movie.id}`).should('exist');
        get('titles-count').should('contain', titlesCount);
        selectFilter('Language & Version');
        get('language').find('input').click();
        get(`option_${Object.keys(movie.languages)[0]}`).click();
        check('Subs');
        get('empty').should('exist');
        get('clear-filter').click();
        get('save-filter').click();
        get(`movie-card_${movie.id}`).should('exist');
        get('titles-count').should('contain', titlesCount);
        selectFilter('Release Year');
        get('slider').focus();
        selectYear(2030);
        get('empty').should('exist');
        get('clear-filter').click();
        get('save-filter').click();
        get(`movie-card_${movie.id}`).should('exist');
        get('titles-count').should('contain', titlesCount);
        selectFilter('Running Time');
        get('13min - 26min').click();
        get('titles-count').should('not.contain', titlesCount);
        get(`movie-card_${movie.id}`).should('not.exist');
        get('clear-filter').click();
        get('save-filter').click();
        get(`movie-card_${movie.id}`).should('exist');
      });
    });
  });

  it('Absent if not released', () => {
    firestore.update({ docPath: `movies/${movie.id}`, field: 'app.catalog.status', value: 'draft' });
    syncMovieToAlgolia(movie.id);
    get('title-link').eq(0).click();
    get('titles-count').then($result => {
      titlesCount = $result[0].innerText;
      get('search-input').type(movie.title.international);
      get('titles-count').should('not.contain', titlesCount);
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
    get('titles-count').then($result => {
      titlesCount = $result[0].innerText;
      get('search-input').type(movie.title.international);
      //wait for the count to update before checking our movie
      get('titles-count').should('not.contain', titlesCount);
      get(`movie-card_${movie.id}`).should('exist');
    });
    get('export').click();
    cy.contains('Please wait, your export is being generated...');
  });

  it('Can load more movies', () => {
    get('title-link').eq(0).click();
    getAllStartingWith('movie-card_').should('have.length', 50);
    get('load-more').click();
    getAllStartingWith('movie-card_').should('have.length', 100);
  });
});
