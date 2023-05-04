import {
  // plugins
  adminAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  connectUser,
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
import { buyer, seller, offer, saleContract, buyerNegotiation, bucket } from '../../fixtures/shared/deal-shared-fixture';
import { supportMailosaur } from '@blockframes/utils/constants';
import { capitalize } from '@blockframes/utils/helpers';
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
  [`offers/${offer.id}`]: offer,
  [`contracts/${saleContract.id}`]: saleContract,
  [`contracts/${saleContract.id}/negotiations/${buyerNegotiation.id}`]: buyerNegotiation,
  [`buckets/${bucket.id}`]: bucket,
};

describe('Deal negotiation', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    adminAuth.deleteAllTestUsers();
    adminAuth.createUser({ uid: buyer.user.uid, email: buyer.user.email, emailVerified: true });
    adminAuth.createUser({ uid: seller.user.uid, email: seller.user.email, emailVerified: true });
    firestore.deleteContractsAndTerms(seller.org.id);
    firestore.queryDelete({ collection: 'contracts', field: 'buyerId', operator: '==', value: buyer.org.id });
    firestore.queryDelete({ collection: 'offers', field: 'buyerId', operator: '==', value: buyer.org.id });
    firestore.deleteNotifications([buyer.user.uid, seller.user.uid]);
    firestore.clearTestData();
    firestore.create([injectedData]);
    maintenance.end();
    connectUser(seller.user.email);
    cy.visit(`/c/o/dashboard/sales/${saleContract.id}/view`);
  });

  it('Seller accepts the offer', () => {
    get('accept').click();
    //close button
    get('confirm').should('exist');
    get('close').click();
    get('confirm').should('not.exist');
    //confirm button behaviour
    get('accept').click();
    get('confirm').should('be.disabled');
    get('terms').click();
    get('confirm').should('be.enabled');
    //confirm
    get('status-tag').should('contain', 'New');
    get('confirm').click();
    snackbarShould('contain', 'You accepted contract for International title');
    get('status-tag').should('contain', 'Accepted');
    //sales main page
    checkMainSalePage('accepted');
    //emails & notifications creation
    checkConfirmationEmails('accepted');
    checkNotification('seller', 'accepted');
    //buyer's offers main page
    connectUser(buyer.user.email);
    cy.visit('/c/o/marketplace/offer');
    get('row_0_col_6').should('contain', 'Accepted');
    //offer page
    get('row_0_col_0').click();
    get('status-tag').should('contain', 'Accepted');
    get('row_0_col_4').should('contain', 'Accepted');
    checkNotification('buyer', 'accepted');
  });

  it('Seller declines the offer', () => {
    get('negotiate').click();
    //negotitation page
    assertUrl(`c/o/dashboard/sales/${saleContract.id}/negotiation`);
    get('decline').click();
    //close button
    get('confirm').should('exist');
    get('cancel').click();
    get('confirm').should('not.exist');
    //confirm button behaviour
    get('decline').click();
    get('confirm').should('be.disabled');
    get('terms').click();
    get('confirm').should('be.enabled');
    //confirm
    get('reason-select').click();
    get('Other').click();
    get('text-area').type('E2E - seller declines');
    get('confirm').click();
    snackbarShould('contain', 'Offer declined.');
    get('status-tag').should('contain', 'Declined');
    //sales main page
    checkMainSalePage('declined');
    //emails & notifications creation
    checkConfirmationEmails('declined');
    checkNotification('seller', 'declined');
    //buyer's offers main page
    connectUser(buyer.user.email);
    cy.visit('/c/o/marketplace/offer');
    get('row_0_col_6').should('contain', 'Declined');
    //offer page
    get('row_0_col_0').click();
    get('status-tag').should('contain', 'Declined');
    get('row_0_col_4').should('contain', 'Declined');
    checkNotification('buyer', 'declined');
  });

  it('Seller negotiates the offer', () => {
    get('negotiate').click();
    //negotitation page
    assertUrl(`c/o/dashboard/sales/${saleContract.id}/negotiation`);
    //modifying price
    get('price').clear().type('15000');
    //adding Latin America
    get('territories').should('contain', 'Europe');
    get('territories').click();
    get('Latin America').click();
    escapeKey();
    //taking off free TV
    get('medias').should('contain', 'TV');
    get('medias').click();
    get('freeTv').click();
    escapeKey();
    //adding one month before and after
    get('dateFrom').clear().type(dateToMMDDYYYY(seller.term.duration.from));
    get('dateTo').clear().type(dateToMMDDYYYY(seller.term.duration.to));
    //changing to exclusive
    get('exclusivity').click();
    get('exclusive').click();
    //add french version
    get('add-version').click();
    get('languages').find('input').type('f');
    get('option_french').click();
    get('save-language').click();
    get('subtitle').click();
    get('dubbed').click();
    get('caption').click();
    //save & submit
    assertTableRowData(0, [
      dateToMMDDYYYY(seller.term.duration.from),
      dateToMMDDYYYY(seller.term.duration.to),
      'Latin America, Europe',
      'Pay TV, Pay Per View',
      'Yes',
      'French: Dubs, Subs, CC',
    ]);
    get('row-save').click();
    acceptCookies(); //it hides the submit button
    get('submit').click();
    get('modal').should('exist');
    get('confirm').click();
    snackbarShould('contain', 'Your counter offer has been sent');
    get('status-tag').should('contain', 'In Negotiation');
    //sales main page
    checkMainSalePage('negotiating');
    //emails & notifications creation
    checkConfirmationEmails('negotiating');
    checkNotification('seller', 'negotiating');
    //buyer's offers main page
    connectUser(buyer.user.email);
    cy.visit('/c/o/marketplace/offer');
    get('row_0_col_6').should('contain', 'In Negotiation');
    //offer page
    get('row_0_col_0').click();
    get('status-tag').should('contain', 'In Negotiation');
    get('row_0_col_4').should('contain', 'In Negotiation');
    checkNotification('buyer', 'negotiating');
    //contract page
    cy.visit(`c/o/marketplace/offer/${offer.id}/${saleContract.id}`);
    get('offer-price').should('contain', '€15,000.00');
    assertTableRowData(0, [
      dateToMMDDYYYY(seller.term.duration.from),
      dateToMMDDYYYY(seller.term.duration.to),
      'Latin America, Europe',
      'Pay TV, Pay Per View',
      'Yes',
      'French (Dubs, Subs, CC)',
    ]);
    //accept
    get('accept').click();
    get('terms').click();
    get('confirm').click();
    snackbarShould('contain', `You accepted contract for ${seller.movie.title.international}`);
    get('status-tag').should('contain', 'Accepted');
    //checking on seller's side
    connectUser(seller.user.email);
    cy.visit('c/o/dashboard/sales');
    get('row_0_col_5').should('contain', '€15,000.00');
    get('row_0_col_6').should('contain', 'Accepted');
  });
});

//* functions

function checkConfirmationEmails(decision: ContractStatus) {
  for (const user of ['buyer', 'seller', 'admin']) {
    interceptEmail({ sentTo: mailData[user].recipient, subject: mailData[user].subject[decision] }).then(mail => {
      cy.log(`mail received by ${user} ${mailData[user].recipient}: ${mailData[user].subject[decision]}`);
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

function checkMainSalePage(decision: ContractStatus) {
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
      accepted: `Your offer for ${seller.movie.title.international} was just accepted!`,
      declined: 'Your offer was declined',
      negotiating: `You just received a counter-offer for ${seller.movie.title.international}`,
    },
  },
  seller: {
    recipient: seller.user.email,
    subject: {
      accepted: `You accepted an offer`,
      declined: 'You declined an offer',
      negotiating: `Counter-offer for ${seller.movie.title.international} was successfully submitted`,
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
    accepted: `Your offer ${offer.id} was accepted. The Archipel Content team will contact you shortly.`,
    declined: `Your offer for ${seller.movie.title.international} was declined.`,
    negotiating: `${seller.org.name} sent a counter-offer for ${seller.movie.title.international}.`,
  },
  seller: {
    accepted: `Congrats for accepting the offer ${offer.id}. The agreement will now be drafted offline.`,
    declined: `The offer for ${seller.movie.title.international} was successfully declined.`,
    negotiating: `Your counter-offer for ${seller.movie.title.international} was successfully sent to ${buyer.org.name}.`,
  },
};
