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
  escapeKey,
  dateToMMDDYYYY,
} from '@blockframes/testing/cypress/browser';
import { Media, MediaGroup, Territory, TerritoryGroup } from '@blockframes/model';
import { buyer, seller1 } from '../../fixtures/shared/avails-search';
import { add, sub } from 'date-fns';

const injectedData = {
  //buyer
  [`users/${buyer.user.uid}`]: buyer.user,
  [`orgs/${buyer.org.id}`]: buyer.org,
  [`permissions/${buyer.orgPermissions.id}`]: buyer.orgPermissions,
  //seller1
  [`users/${seller1.user.uid}`]: seller1.user,
  [`orgs/${seller1.org.id}`]: seller1.org,
  [`permissions/${seller1.orgPermissions.id}`]: seller1.orgPermissions,
  [`movies/${seller1.movie.id}`]: seller1.movie,
  [`permissions/${seller1.orgPermissions.id}/documentPermissions/${seller1.moviePermissions.id}`]: seller1.moviePermissions,
  [`contracts/${seller1.contract.id}`]: seller1.contract,
  [`terms/${seller1.term.id}`]: seller1.term,
};

let searchAvailsForSeller1MovieUrl: string;

describe('Marketplace avails search', () => {
  before(() => {
    cy.visit('');
    maintenance.start();
    algolia.deleteMovie({ app: 'catalog', objectId: seller1.movie.id });
    firestore.deleteContractsAndTerms(seller1.org.id);
    firestore.queryDelete({ collection: 'contracts', field: 'buyerId', operator: '==', value: buyer.org.id });
    firestore.queryDelete({ collection: 'offers', field: 'buyerId', operator: '==', value: buyer.org.id });
    firestore.deleteNotifications([buyer.user.uid, seller1.user.uid]);
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    syncMovieToAlgolia(seller1.movie.id);
    adminAuth.createUser({ uid: buyer.user.uid, email: buyer.user.email, emailVerified: true });
    adminAuth.createUser({ uid: seller1.user.uid, email: seller1.user.email, emailVerified: true });
    maintenance.end();
    connectUser(buyer.user.email);
    get('skip-preferences').click();
  });

  context('Seller1 movie', () => {
    beforeEach(() => {
      cy.visit(searchAvailsForSeller1MovieUrl || 'c/o/marketplace/title');
      selectFilter('Avails');
    });

    it('Buyer can find an avail with the good inputs', () => {
      searchAvailsForSeller1Movie();
      // keep the final search url to use in other tests as landing page, which saves time
      cy.url().then(url => (searchAvailsForSeller1MovieUrl = url));
    });

    context('Failing territories', () => {
      it('Buyer cannot find an avail with wrong territories', () => {
        resetTerritories('Europe');
        get('CIS').click();
        escapeKey();
        get('save-filter').click();
        get('empty').should('exist');
      });

      it('Buyer cannot find an avail with both good and wrong territories', () => {
        resetTerritories('Europe');
        get('CIS').click();
        get('Europe').click();
        escapeKey();
        get('save-filter').click();
        get('empty').should('exist');
      });
    });

    context('Failing medias', () => {
      it('Buyer cannot find an avail with wrong media group', () => {
        resetMedias('TV');
        get('VOD').click();
        escapeKey();
        get('save-filter').click();
        get('empty').should('exist');
      });

      it('Buyer cannot find an avail with both good and wrong media groups', () => {
        resetMedias('TV');
        get('VOD').click();
        get('TV').click();
        escapeKey();
        get('save-filter').click();
        get('empty').should('exist');
      });
    });

    context('Failing dates', () => {
      it('Buyer cannot find an avail with wrong starting date', () => {
        const oneDayTooEarly = sub(seller1.term.duration.from, { days: 1 });
        get('dateFrom').clear();
        waitFforUpdate();
        get('dateFrom').type(dateToMMDDYYYY(oneDayTooEarly));
        get('save-filter').click();
        get('empty').should('exist');
      });

      it('Buyer cannot find an avail with wrong ending date', () => {
        const oneDayTooLate = add(seller1.term.duration.to, { days: 1 });
        get('dateTo').clear();
        waitFforUpdate();
        get('dateTo').type(dateToMMDDYYYY(oneDayTooLate));
        get('save-filter').click();
        get('empty').should('exist');
      });
    });

    context('Failing exclusivity', () => {
      it('Buyer cannot find an avail with wrong exclusivity', () => {
        cy.visit(searchAvailsForSeller1MovieUrl.replace('exclusive%22:false', 'exclusive%22:true'));
        get('empty').should('exist');
      });
    });
  });
});

//* functions

function searchAvailsForSeller1Movie() {
  get('territories').click();
  get('Europe').click();
  escapeKey();
  get('medias').click();
  get('TV').click();
  escapeKey();
  get('dateFrom').clear().type(dateToMMDDYYYY(seller1.term.duration.from));
  get('dateTo').clear().type(dateToMMDDYYYY(seller1.term.duration.to));
  get('exclusivity').click();
  get('non-exclusive').click();
  get('save-filter').click();
  get('titles-count').should('contain', 'There is 1 title available.');
  get(`movie-card_${seller1.movie.id}`).should('exist');
}

function resetTerritories(baseTerritories: (Territory | TerritoryGroup) | (Territory | TerritoryGroup)[]) {
  if (!Array.isArray(baseTerritories)) baseTerritories = [baseTerritories];
  get('territories').click();
  for (const territory of baseTerritories) get(territory).click();
  waitFforUpdate();
}

function resetMedias(baseMedias: (Media | MediaGroup) | (Media | MediaGroup)[]) {
  if (!Array.isArray(baseMedias)) baseMedias = [baseMedias];
  get('medias').click();
  for (const media of baseMedias) get(media).click();
  waitFforUpdate();
}

function waitFforUpdate() {
  return get('titles-count').should('contain', 'There are 451 titles available.');
}
