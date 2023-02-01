import {
  // plugins
  adminAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  connectOtherUser,
  assertTableRowData,
  snackbarShould,
  interceptEmail,
  assertUrl,
  deleteEmail,
  escapeKey,
  acceptCookies,
  // helpers
  dateToMMDDYYYY,
} from '@blockframes/testing/cypress/browser';
//no need for a new fixture
import {
  buyer,
  seller,
  offer,
  saleContract,
  buyerNegotiation,
  sellerNegotiation,
  bucket,
} from '../../fixtures/shared/deal-shared-fixture';
import { supportMailosaur } from '@blockframes/utils/constants';
import { capitalize } from '@blockframes/utils/helpers';
import { add, sub } from 'date-fns';
import { ContractStatus } from '@blockframes/model';

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
  [`offers/${offer.id}`]: { ...offer, status: 'negotiating' }, //negotiating because the seller made a counter offer
  [`contracts/${saleContract.id}`]: saleContract,
  [`contracts/${saleContract.id}/negotiations/${buyerNegotiation.id}`]: buyerNegotiation,
  [`contracts/${saleContract.id}/negotiations/${sellerNegotiation.id}`]: sellerNegotiation,
  [`buckets/${bucket.id}`]: bucket,
};

/** Test purpose
 * We simulate the actions a buyer can make, AFTER a seller made a counter-offer regarding the buyer first offer.
 */

describe('Deal negotiation', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    adminAuth.deleteAllTestUsers();
    adminAuth.createUser({ uid: buyer.user.uid, email: buyer.user.email, emailVerified: true });
    adminAuth.createUser({ uid: seller.user.uid, email: seller.user.email, emailVerified: true });
    firestore.deleteContractsAndTerms(seller.org.id);
    firestore.deleteBuyerContracts(buyer.org.id);
    firestore.deleteOffers(buyer.org.id);
    firestore.deleteNotifications([buyer.user.uid, seller.user.uid]);
    firestore.clearTestData();
    firestore.create([injectedData]);
    maintenance.end();
    connectOtherUser(buyer.user.email);
    cy.visit(`/c/o/marketplace/offer/${offer.id}/${saleContract.id}`);
  });

  it('The UI reflects the counter offer data', () => {
    get('status-tag').should('contain', 'In Negotiation');
    get('offer-price').should('contain', '€15,000.00');
    assertTableRowData(0, [
      dateToMMDDYYYY(seller.term.duration.from),
      dateToMMDDYYYY(seller.term.duration.to),
      'Latin America, Europe',
      'Pay TV, Pay Per View',
      'Yes',
      'French (Dubs, Subs, CC)',
    ]);
  });

  it('If the offer has no price, seller can only negotiate', () => {
    get('accept').should('exist');
    get('negotiate').should('exist');
    firestore.update({
      docPath: `contracts/${saleContract.id}/negotiations/${sellerNegotiation.id}`,
      field: 'price',
      value: null,
    });
    get('accept').should('not.exist');
    get('negotiate').should('exist');
  });

  it('Buyer declines the counter-offer', () => {
    get('negotiate').click();
    assertUrl(`c/o/marketplace/offer/${offer.id}/${saleContract.id}/negotiate`);
    get('decline').click();
    get('modal').should('exist');
    get('reason-select').click();
    get('The offer is not satisfactory').click();
    get('text-area').type('E2E - buyer declines');
    get('terms').click();
    get('confirm').click();
    snackbarShould('contain', 'Offer declined.');
    get('status-tag').should('contain', 'Declined');
    checkConfirmationEmails('declined');
    checkNotification('buyer', 'declined');
    checkMainOfferPage('declined');
    checkMainSalePage('declined');
  });

  it('Buyer accepts the counter-offer', () => {
    get('accept').click();
    get('terms').click();
    get('confirm').click();
    snackbarShould('contain', 'You accepted contract for International title');
    get('status-tag').should('contain', 'Accepted');
    checkConfirmationEmails('accepted');
    checkNotification('buyer', 'accepted');
    checkMainOfferPage('accepted');
    checkMainSalePage('accepted');
  });

  it('Buyer makes a counter-counter-offer', () => {
    get('negotiate').click();
    get('price').clear().type('20000');
    get('territories').click();
    get('CIS').click();
    escapeKey();
    get('medias').should('contain', 'TV');
    get('medias').click();
    get('VOD').click();
    escapeKey();
    get('dateFrom')
      .clear()
      .type(dateToMMDDYYYY(add(seller.term.duration.from, { days: 15 })));
    get('dateTo')
      .clear()
      .type(dateToMMDDYYYY(sub(seller.term.duration.to, { days: 15 })));
    get('exclusivity').click();
    get('non-exclusive').click();
    get('caption').click(); //cunchecking this option
    //save & submit
    assertTableRowData(0, [
      dateToMMDDYYYY(add(seller.term.duration.from, { days: 15 })),
      dateToMMDDYYYY(sub(seller.term.duration.to, { days: 15 })),
      'Latin America, CIS, Europe',
      'VOD, Pay TV, Pay Per View',
      'No',
      'French: Dubs, Subs',
    ]);
    get('row-save').click();
    acceptCookies();
    get('submit').click();
    get('modal').should('exist');
    get('confirm').click();
    snackbarShould('contain', 'Your counter offer has been sent');
    get('status-tag').should('contain', 'In Negotiation');
    checkConfirmationEmails('negotiating');
    checkNotification('buyer', 'negotiating');
    checkMainOfferPage('negotiating');
    checkMainSalePage('negotiating');
  });
});

//* functions

function checkConfirmationEmails(decision: ContractStatus) {
  for (const user of ['buyer', 'seller', 'admin']) {
    interceptEmail({ sentTo: mailData[user].recipient }).then(mail => {
      expect(mail.subject).to.eq(mailData[user].subject[decision]);
      return deleteEmail(mail.id);
    });
  }
}

function checkNotification(user: 'buyer' | 'seller', decision: ContractStatus) {
  get('notifications-link').should('contain', '1').click();
  get('notification-message').should('have.length', 1).and('contain', notificationText[user][decision]);
  get('mark-as-read').click();
  get('notifications-link').should('not.contain', '1');
  get('already-read').should('exist');
}

function checkMainOfferPage(decision: ContractStatus) {
  cy.visit('/c/o/marketplace/offer');
  get('all-offers').should('contain', '(1)');
  get('offers').should('not.contain', '(1)');
  get('ongoing-deals').should(decision !== 'declined' ? 'contain' : 'not.contain', '(1)');
  get('past-deals').should(decision === 'declined' ? 'contain' : 'not.contain', '(1)');
  get('row_0_col_6').should('contain', decision === 'negotiating' ? 'In Negotiation' : capitalize(decision));
}

function checkMainSalePage(decision: ContractStatus) {
  connectOtherUser(seller.user.email);
  get('sales').click();
  get('all').should('contain', '(1)');
  get('new').should('not.contain', '(1)');
  get('ongoing').should(decision === 'negotiating' ? 'contain' : 'not.contain', '(1)');
  get('accepted').should(decision === 'accepted' ? 'contain' : 'not.contain', '(1)');
  get('declined').should(decision === 'declined' ? 'contain' : 'not.contain', '(1)');
  get('row_0_col_6').should('contain', decision === 'negotiating' ? 'In Negotiation' : capitalize(decision));
}

//* functions' consts

const mailData = {
  buyer: {
    recipient: buyer.user.email,
    subject: {
      accepted: `You accepted an offer`,
      declined: 'You declined an offer',
      negotiating: `Counter-offer for ${seller.movie.title.international} was successfully submitted`,
    },
  },
  seller: {
    recipient: seller.user.email,
    subject: {
      accepted: `Your offer for ${seller.movie.title.international} was just accepted!`,
      declined: 'Your offer was declined',
      negotiating: `You just received a counter-offer for ${seller.movie.title.international}`,
    },
  },
  admin: {
    recipient: supportMailosaur,
    subject: {
      accepted: 'Contract accepted',
      declined: 'Contract declined',
      negotiating: 'Counter offer created',
    },
  },
};

const notificationText = {
  buyer: {
    accepted: `Congrats for accepting the offer ${offer.id}. The agreement will now be drafted offline.`,
    declined: `The offer for ${seller.movie.title.international} was successfully declined.`,
    negotiating: `Your counter-offer for ${seller.movie.title.international} was successfully sent to ${seller.org.name}.`,
  },
  seller: {
    accepted: `Your offer ${offer.id} was accepted. The Archipel Content team will contact you shortly.`,
    declined: `Your offer for ${seller.movie.title.international} was declined.`,
    negotiating: `${buyer.org.name} sent a counter-offer for ${seller.movie.title.international}.`,
  },
};
