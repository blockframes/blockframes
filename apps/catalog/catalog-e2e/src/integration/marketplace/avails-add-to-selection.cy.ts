import {
  // plugins
  adminAuth,
  algolia,
  firestore,
  maintenance,
  // cypress commands
  get,
  connectUser,
  syncMovieToAlgolia,
  selectFilter,
  dateToMMDDYYYY,
  // avails functions
  selectTerritories,
  selectMedias,
  selectDates,
  selectNonExclusive,
  snackbarShould,
  assertUrlIncludes,
  assertMultipleTexts,
  assertInputValue,
} from '@blockframes/testing/cypress/browser';
import { displayName, genres } from '@blockframes/model';

// using same feature with a little simplification
import { buyer, seller } from '../../fixtures/marketplace/avails-search';
seller.contract.termIds = [seller.term1.id];

const injectedData = {
  //buyer
  [`users/${buyer.user.uid}`]: buyer.user,
  [`orgs/${buyer.org.id}`]: buyer.org,
  [`permissions/${buyer.orgPermissions.id}`]: buyer.orgPermissions,
  //seller
  [`users/${seller.user.uid}`]: seller.user,
  [`orgs/${seller.org.id}`]: seller.org,
  [`permissions/${seller.orgPermissions.id}`]: seller.orgPermissions,
  [`movies/${seller.movie.id}`]: seller.movie,
  [`permissions/${seller.orgPermissions.id}/documentPermissions/${seller.moviePermissions.id}`]: seller.moviePermissions,
  [`contracts/${seller.contract.id}`]: seller.contract,
  [`terms/${seller.term1.id}`]: seller.term1,
};

describe('Marketplace : add to selection', () => {
  before(() => {
    cy.visit('');
    maintenance.start();
    algolia.deleteMovie({ app: 'catalog', objectId: seller.movie.id });
    firestore.deleteContractsAndTerms(seller.org.id);
    firestore.queryDelete({ collection: 'contracts', field: 'buyerId', operator: '==', value: buyer.org.id });
    firestore.queryDelete({ collection: 'offers', field: 'buyerId', operator: '==', value: buyer.org.id });
    firestore.deleteNotifications([buyer.user.uid, seller.user.uid]);
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    syncMovieToAlgolia(seller.movie.id);
    adminAuth.createUser({ uid: buyer.user.uid, email: buyer.user.email, emailVerified: true });
    adminAuth.createUser({ uid: seller.user.uid, email: seller.user.email, emailVerified: true });
    maintenance.end();
    connectUser(buyer.user.email);
    get('skip-preferences').click();
  });

  context('Titles list', () => {
    it('Buyer can only add to selection if avails filter is filled', () => {
      const { movie, term1 } = seller;
      const { from, to } = term1.duration;
      cy.visit('c/o/marketplace/title');
      get('clear-filters').click(); // #8655 Force availsForm observabe to trigger when there is no params in URL
      get('add-to-bucket').eq(0).click();
      snackbarShould('contain', 'Please fill in your Avail Search Criteria first.');
      snackbarShould('not.exist');
      cy.get('main').scrollTo('top'); // to make the header visible again
      get('bucket').should('not.contain', '1');
      selectFilter('Avails');
      selectTerritories('Europe');
      selectMedias('TV');
      selectDates(from, to);
      selectNonExclusive();
      get('save-filter').click();
      get('titles-count').should('contain', 'There is 1 title available.');
      get(`movie-card_${movie.id}`).should('exist');
      get('add-to-bucket').eq(0).click();
      snackbarShould('contain', `${movie.title.international} was added to your Selection`);
      get('bucket').should('contain', '1').click();
      assertUrlIncludes('c/o/marketplace/selection');
      get('one-title').should('exist');
      get('selected-titles').should('contain', movie.title.international);
      get('selection-currency').should('contain', 'Euro');
      assertInputValue('price', '');
      get(`movie-card_${movie.id}`).should('exist');
      get('movie-title').should('contain', movie.title.international);
      assertMultipleTexts('movie-article', [displayName(movie.directors[0]), `${genres[movie.genres[0]]}, ...`]);
      get('row_0_col_0').should('contain', dateToMMDDYYYY(from));
      get('row_0_col_1').should('contain', dateToMMDDYYYY(to));
      get('row_0_col_2').should('contain', 'Europe');
      get('row_0_col_3').should('contain', 'TV');
      get('row_0_col_4').should('contain', 'No');
    });
  });
});
