import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  assertUrlIncludes,
  connectOtherUser,
  assertTableRowData,
  assertUrl,
  // helpers
  dateToMMDDYYYY,
} from '@blockframes/testing/cypress/browser';
import { buyer, seller, offer, saleContract, buyerNegotiation, bucket } from '../../fixtures/shared/deal-shared-fixture';
import { Organization, displayName, trimString } from '@blockframes/model';
import { centralOrgId } from '@env';

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
  [`terms/${seller.term.id}`]: seller.term,
  //offer, sale contract & bucket
  [`offers/${offer.id}`]: offer,
  [`contracts/${saleContract.id}`]: saleContract,
  [`contracts/${saleContract.id}/negotiations/${buyerNegotiation.id}`]: buyerNegotiation,
  [`buckets/${bucket.id}`]: bucket,
};

describe('Deal negociation', () => {
  before(() => {
    cy.visit('');
    maintenance.start();
    firestore.deleteContractsAndTerms(seller.org.id);
    firestore.queryDelete({ collection: 'contracts', field: 'buyerId', operator: '==', value: buyer.org.id });
    firestore.queryDelete({ collection: 'offers', field: 'buyerId', operator: '==', value: buyer.org.id });
    firestore.deleteNotifications([buyer.user.uid, seller.user.uid]);
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: buyer.user.uid, email: buyer.user.email, emailVerified: true });
    adminAuth.createUser({ uid: seller.user.uid, email: seller.user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
  });

  it('Buyer and Seller can acces the offer / sale page', () => {
    browserAuth.signinWithEmailAndPassword(buyer.user.email);
    cy.visit('');
    get('skip-preferences').click();
    get('menu').click();
    get('offers').click();
    assertUrlIncludes('/c/o/marketplace/offer');
    connectOtherUser(seller.user.email);
    get('sales').click();
    assertUrlIncludes('/c/o/dashboard/sales');
  });

  context('buyer side', () => {
    beforeEach(() => {
      connectOtherUser(buyer.user.email);
      cy.visit('/c/o/marketplace/offer');
    });

    it('UI reflects database', () => {
      //offer page
      get('row_0_col_0').click();
      assertUrlIncludes(`c/o/marketplace/offer/${offer.id}`);
      get('offer-id').should('contain', offer.id);
      get('offer-creation').should('contain', `Offer created: ${dateToMMDDYYYY(new Date())}`);
      get('offer-length').should('contain', '1 Title');
      get('offer-price').should('contain', 'Total: €10,000.00');
      get('offer-specificity').should('contain', offer.specificity);
      assertTableRowData(0, [
        seller.movie.title.international,
        seller.movie.release.year.toString(),
        seller.movie.directors.map(director => `${displayName(director)}`).join(', '),
        '€10,000.00',
        'New',
        trimString(`Waiting for ${seller.org.name} answer`, 50),
      ]);
      //sale contract page
      get('row_0_col_0').click();
      assertUrlIncludes(`c/o/marketplace/offer/${offer.id}/${saleContract.id}`);
      checkAvailsSection();
      assertTableRowData(0, [
        dateToMMDDYYYY(buyerNegotiation.terms[0].duration.from),
        dateToMMDDYYYY(buyerNegotiation.terms[0].duration.to),
        'Europe',
        'TV',
        'No',
        '-',
      ]);
      //go back to previous page
      get('back').click();
      assertUrl(`c/o/marketplace/offer/${offer.id}`);
    });
  });

  context('seller side', () => {
    beforeEach(() => {
      connectOtherUser(seller.user.email);
      cy.visit('/c/o/dashboard/sales');
    });

    it('UI reflects datatbase', () => {
      //sales landing page
      get('all').should('contain', '(1)');
      get('new').should('contain', '(1)');
      get('ongoing').should('not.contain', '(1)');
      get('accepted').should('not.contain', '(1)');
      get('declined').should('not.contain', '(1)');
      firestore
        .get(`orgs/${centralOrgId.catalog}`)
        .then((org: Organization) =>
          assertTableRowData(0, [
            dateToMMDDYYYY(new Date()),
            org.name,
            buyer.org.name,
            offer.id,
            seller.movie.title.international,
            '€10,000.00',
            'New',
            'To be Reviewed',
          ])
        );
      //specific sale page
      get('row_0_col_0').click();
      assertUrlIncludes(`/c/o/dashboard/sales/${saleContract.id}/view`);
      get('see-terms').should('exist');
      checkAvailsSection();
      assertTableRowData(0, [
        dateToMMDDYYYY(buyerNegotiation.terms[0].duration.from),
        dateToMMDDYYYY(buyerNegotiation.terms[0].duration.to),
        'Europe',
        'TV',
        'No',
        '-',
      ]);
    });

    it('If the offer has no price, seller can only negotiate', () => {
      cy.visit(`/c/o/dashboard/sales/${saleContract.id}/view`);
      get('accept').should('exist');
      get('negotiate').should('exist');
      firestore.update({
        docPath: `contracts/${saleContract.id}/negotiations/${buyerNegotiation.id}`,
        field: 'price',
        value: null,
      });
      get('accept').should('not.exist');
      get('negotiate').should('exist');
    });
  });
});

//* functions

function checkAvailsSection() {
  return get('avails-section')
    .should('contain', seller.movie.title.international)
    .and('contain', seller.movie.directors.map(director => `${director.firstName} ${director.lastName}`).join(', '))
    .and('contain', seller.movie.release.year.toString())
    .and('contain', '€10,000.00');
}
