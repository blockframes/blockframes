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
import { Media, MediaGroup, medias, Term, Territory, TerritoryGroup } from '@blockframes/model';
import { buyer, seller } from '../../fixtures/marketplace/avails-search';
import { add, sub } from 'date-fns';

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
  [`terms/${seller.term2.id}`]: seller.term2,
  [`terms/${seller.term3.id}`]: seller.term3,
  [`terms/${seller.term4.id}`]: seller.term4,
  [`terms/${seller.term5.id}`]: seller.term5,
};

let searchAvailsForTerm1Url: string;
let titlesCount: string;

describe('Marketplace avails search', () => {
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

  context('First term', () => {
    beforeEach(() => {
      cy.visit(searchAvailsForTerm1Url || 'c/o/marketplace/title');
      selectFilter('Avails');
    });

    it('Buyer can find an avail with the good inputs', () => {
      get('titles-count').then(([count]) => (titlesCount = count.innerText));
      searchAvailsForMovieTerm1();
      // keep the final search url to use in other tests as landing page, which saves time
      cy.url().then(url => (searchAvailsForTerm1Url = url));
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
        const oneDayTooEarly = sub(seller.term1.duration.from, { days: 1 });
        get('dateFrom').clear();
        waitForUpdate();
        get('dateFrom').type(dateToMMDDYYYY(oneDayTooEarly));
        get('save-filter').click();
        get('empty').should('exist');
      });

      it('Buyer cannot find an avail with wrong ending date', () => {
        const oneDayTooLate = add(seller.term1.duration.to, { days: 1 });
        get('dateTo').clear();
        waitForUpdate();
        get('dateTo').type(dateToMMDDYYYY(oneDayTooLate));
        get('save-filter').click();
        get('empty').should('exist');
      });
    });

    context('Failing exclusivity', () => {
      it('Buyer cannot find an avail with wrong exclusivity', () => {
        cy.visit(searchAvailsForTerm1Url.replace('exclusive%22:false', 'exclusive%22:true'));
        get('empty').should('exist');
      });
    });
  });

  context('Overlaps : term2 & 3 (medias), then term4 & 5 (territories)', () => {
    beforeEach(() => {
      cy.visit('c/o/marketplace/title');
      selectFilter('Avails');
    });

    context('Avails with media overlapping leads to 2 differents terms', () => {
      it('in multiple territories', () => {
        searchAvailsMediaOverlap();
        get(`movie-card_${seller.movie.id}`).click();
        get('Avails').click();
        cy.get('[fill="#7795ff"]').should('not.exist');
        selectMedias('TV');
        selectDates(seller.term2);
        selectNonExclusive();
        cy.get('[fill="#7795ff"]').should('have.length', seller.term2.territories.length);
        get('select-all').click();
        assertMediaOverlapTerms();
      });

      it('in single territory', () => {
        searchAvailsMediaOverlap();
        get(`movie-card_${seller.movie.id}`).click();
        get('Avails').click();
        get('single-territory').click();
        get('calendar').find('.available').should('not.exist');
        selectTerritories('Europe');
        selectMedias('TV');
        selectNonExclusive();
        //TODO : uncomment below line when issue #9140 part 5 has been fixed (2024 term1 should be available)
        //get('calendar').find('.available').should('have.length', 18);
        get('calendar').find('tr').eq(3).find('td').eq(0).click();
        get('calendar').find('tr').eq(3).find('td').eq(5).click();
        assertMediaOverlapTerms(true);
      });
    });

    context('Avails with territory overlapping leads to 2 differents terms', () => {
      //TODO : delete this 'before' when issue #9140 part 5 is fixed (and include term4 & 5 in the contract fixture)
      before(() => {
        firestore.update({
          docPath: `contracts/${seller.contract.id}`,
          field: 'termIds',
          value: [seller.term4.id, seller.term5.id],
        });
      });

      it('in multiple territories', () => {
        searchAvailsTerritoryOverlap();
        get(`movie-card_${seller.movie.id}`).click();
        get('Avails').click();
        cy.get('[fill="#7795ff"]').should('not.exist');
        selectMedias('TV');
        selectDates(seller.term4);
        selectNonExclusive();
        cy.get('[fill="#7795ff"]').should('have.length', seller.term2.territories.length);
        get('select-all').click();
        assertTerritoryOverlapTerms();
      });

      it('in single territory', () => {
        searchAvailsTerritoryOverlap();
        get(`movie-card_${seller.movie.id}`).click();
        get('Avails').click();
        get('single-territory').click();
        get('calendar').find('.available').should('not.exist');
        selectTerritories('Europe');
        selectMedias('TV');
        selectNonExclusive();
        //TODO : uncomment below line when issue #9140 part 5 has been fixed (2024 term1 should be available)
        //get('calendar').find('.available').should('have.length', 18);
        get('calendar').find('tr').eq(4).find('td').eq(0).click();
        get('calendar').find('tr').eq(4).find('td').eq(5).click();
        assertTerritoryOverlapTerms();
      });
    });
  });
});

//* functions

function searchAvailsForMovieTerm1() {
  selectTerritories('Europe');
  selectMedias('TV');
  selectDates(seller.term1);
  selectNonExclusive();
  saveAndAssertMovieCardExists();
}

// overlap of sellerTerm2 & 3
function searchAvailsMediaOverlap() {
  selectTerritories('Europe');
  selectMedias('TV');
  selectDates(seller.term2);
  selectNonExclusive();
  saveAndAssertMovieCardExists();
}

function searchAvailsTerritoryOverlap() {
  selectTerritories('Europe');
  selectMedias('TV');
  selectDates(seller.term4);
  selectNonExclusive();
  saveAndAssertMovieCardExists();
}

function selectTerritories(territories: (Territory | TerritoryGroup) | (Territory | TerritoryGroup)[]) {
  if (!Array.isArray(territories)) territories = [territories];
  get('territories').click();
  for (const territory of territories) get(territory).click();
  escapeKey();
}

function selectMedias(medias: (Media | MediaGroup) | (Media | MediaGroup)[]) {
  if (!Array.isArray(medias)) medias = [medias];
  get('medias').click();
  for (const media of medias) get(media).click();
  escapeKey();
}

function selectDates(term: Term) {
  get('dateFrom').clear().type(dateToMMDDYYYY(term.duration.from));
  get('dateTo').clear().type(dateToMMDDYYYY(term.duration.to));
}

function selectNonExclusive() {
  get('exclusivity').click();
  get('non-exclusive').click();
}

function saveAndAssertMovieCardExists() {
  get('save-filter').click();
  get('titles-count').should('contain', 'There is 1 title available.');
  get(`movie-card_${seller.movie.id}`).should('exist');
}

function resetTerritories(baseTerritories: (Territory | TerritoryGroup) | (Territory | TerritoryGroup)[]) {
  if (!Array.isArray(baseTerritories)) baseTerritories = [baseTerritories];
  get('territories').click();
  for (const territory of baseTerritories) get(territory).click();
  waitForUpdate();
}

function resetMedias(baseMedias: (Media | MediaGroup) | (Media | MediaGroup)[]) {
  if (!Array.isArray(baseMedias)) baseMedias = [baseMedias];
  get('medias').click();
  for (const media of baseMedias) get(media).click();
  waitForUpdate();
}

function waitForUpdate() {
  return get('titles-count').should('contain', titlesCount);
}

function assertMediaOverlapTerms(issue9140 = false) {
  // TODO : delete conditionals when issue #9140 part 5 is fixed
  if (!issue9140) get('selected-territories').should('have.length', 2);
  get('selected-territories').eq(0).should('contain', 'Europe');
  get('selected-territories').eq(1).should('contain', 'Europe');
  if (!issue9140) get('selected-medias').should('have.length', 2);
  get('selected-medias').eq(0).click().should('contain', medias[seller.term3.medias[0]]);
  get('selected-medias')
    .eq(1)
    .click()
    .should('contain', medias[seller.term2.medias[0]])
    .and('contain', medias[seller.term2.medias[1]]);
}

function assertTerritoryOverlapTerms() {
  //no need for issue9140 specifities has we kept only term4 & 5 in the contract
  get('selected-territories').should('have.length', 1);
  get('see-more').should('have.length', 1);
  get('selected-territories').should('contain', 'France');
  get('selected-medias').should('have.length', 2);
  get('selected-medias').eq(0).click().should('contain', 'TV');
  get('selected-medias').eq(1).click().should('contain', 'TV');
}
