import { user, org, orgPermissions, moviePermissions, displayMovie as movie } from '../../fixtures/marketplace/display-title';
import { Movie, genres, languages, territories } from '@blockframes/model';
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
  getAllStartingWith,
} from '@blockframes/testing/cypress/browser';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${orgPermissions.id}/documentPermissions/${moviePermissions.id}`]: moviePermissions,
  [`movies/${movie.id}`]: movie,
};

let titlesCount: string;

describe('Movie display in marketplace', () => {
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
    get('skip-preferences').click();
    get('cookies').click();
    assertUrlIncludes('c/o/marketplace/home');
  });

  it('Find with title', () => {
    syncMovieToAlgolia(movie);
    findIn('New on Archipel', 'see-all').click();
    get('titles-count').then($result => {
      titlesCount = $result[0].innerText;
      get('search-input').type(movie.title.international);
      //wait for the count to update before checking our movie
      get('titles-count').should('not.contain', titlesCount);
    });
    movieCardShould('exist');
  });

  it('Find with director', () => {
    syncMovieToAlgolia(movie);
    findIn('New on Archipel', 'see-all').click();
    get('titles-count').then($result => {
      const count = $result[0].innerText;
      get('search-input').type(`${movie.directors[0].firstName} ${movie.directors[0].lastName}`);
      get('titles-count').should('not.contain', count);
    });
    movieCardShould('exist');
  });

  it('Find with keyword', () => {
    syncMovieToAlgolia(movie);
    findIn('New on Archipel', 'see-all').click();
    get('titles-count').then($result => {
      const count = $result[0].innerText;
      get('search-input').type(movie.keywords[0]);
      get('titles-count').should('not.contain', count);
    });
    movieCardShould('exist');
  });

  it('Find with filters', () => {
    syncMovieToAlgolia(movie);
    findIn('New on Archipel', 'see-all').click();
    get('titles-count');
    selectFilter('Content Type');
    selectToggle('content_', 'Movie');
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
    check('dubs');
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
    movieCardShould('exist');
    getAllStartingWith('item_').should('have.length', 1);
  });
});

it('Absent if not released', () => {
  firestore.update({ docPath: `movies/${movie.id}`, field: 'app.catalog.status', value: 'draft' });
  syncMovieToAlgolia(movie);
  findIn('New on Archipel', 'see-all').click();
  get('titles-count').then($result => {
    titlesCount = $result[0].innerText;
    get('search-input').type(movie.title.international);
    get('titles-count').should('not.contain', titlesCount);
  });
  movieCardShould('not.exist');
  get('clear-filters').click();
  get('titles-count').should('contain', titlesCount);
});

function movieCardShould(option: 'exist' | 'not.exist') {
  let titleFound = false;
  return getAllStartingWith('item_').then($elements => {
    const $cards = $elements.children();
    const cardsInnerTexts = $cards.toArray().map(child => child.innerText);
    for (const text of cardsInnerTexts) {
      if (text.includes(movie.title.international)) titleFound = true;
    }
    if (option === 'exist') {
      expect(titleFound).to.equal(true);
    } else {
      expect(titleFound).to.equal(false);
    }
  });
}

function syncMovieToAlgolia(movie: Movie) {
  return firestore
    .get(`movies/${movie.id}`)
    .then((dbMovie: Movie) => algolia.storeMovie({ movie: dbMovie, organizationNames: dbMovie.orgIds }));
}

function selectFilter(name: string) {
  return get('filters').contains(name).click();
}

function selectToggle(prefix: string, text: string) {
  return getAllStartingWith(prefix).then($elements => {
    const $toggles = $elements.children();
    for (const $toggle of $toggles) {
      if ($toggle.innerText === text) cy.wrap($toggle).click();
    }
  });
}

function selectYear(year: number) {
  const steps = Math.floor((year - 1980) / 10);
  if (steps) return cy.get('body').type('{downArrow}'.repeat(steps));
  return;
}
