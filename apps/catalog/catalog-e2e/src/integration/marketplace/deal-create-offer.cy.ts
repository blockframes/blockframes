import { territories, MediaGroup, medias, TerritoryGroup, Notification, Contract } from '@blockframes/model';
import {
  // plugins
  adminAuth,
  algolia,
  browserAuth,
  firestore,
  gmail,
  maintenance,
  // cypress commands
  get,
  assertUrlIncludes,
  escapeKey,
  check,
  connectUser,
  assertTableRowData,
  // cypress tasks
  interceptEmail,
  // helpers
  dateToMMDDYYYY,
  assertMultipleTexts,
  getSubject,
  getTextBody,
  getBodyLinks,
} from '@blockframes/testing/cypress/browser';
import { buyer, seller } from '../../fixtures/marketplace/deal-create-offer';
import { e2eSupportEmail } from '@blockframes/utils/constants';
import { add } from 'date-fns';

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
};

describe('Deal negociation', () => {
  before(() => {
    cy.visit('');
    maintenance.start();
    algolia.deleteMovie({ app: 'catalog', objectId: seller.movie.id });
    firestore.deleteContractsAndTerms(seller.org.id);
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
    browserAuth.signinWithEmailAndPassword(buyer.user.email);
    cy.visit(`/c/o/marketplace/title/${seller.movie.id}/avails/map`);
  });

  it('user can choose between multiple or single territory UI', () => {
    assertUrlIncludes(`c/o/marketplace/title/${seller.movie.id}/avails/map`);
    get('single-territory').click();
    assertUrlIncludes(`c/o/marketplace/title/${seller.movie.id}/avails/calendar`);
    get('multiple-territory').click();
    assertUrlIncludes(`c/o/marketplace/title/${seller.movie.id}/avails/map`);
  });

  context('Multiple territory', () => {
    beforeEach(() => cy.visit(`/c/o/marketplace/title/${seller.movie.id}/avails/map`));

    it('user can select territories by clicking on the map', () => {
      get('missing-criteria').should('exist');
      fillInputs({
        rights: ['TV'],
        dateFrom: seller.term.duration.from,
        dateTo: new Date(seller.term.duration.to),
        exclusive: false,
      });
      get('missing-criteria').should('not.exist');
      selectAllAvailable();
      get('see-more').click();
      assertModalTerritories();
      assertSelectedMedias('TV');
    });

    it('user can select all available territories at once with the dedicated button', () => {
      fillInputs({
        rights: ['TV'],
        dateFrom: seller.term.duration.from,
        dateTo: new Date(seller.term.duration.to),
        exclusive: false,
      });
      // force click because the input is hidden by mat-label since angular 15 migration
      get('select-all').click({ force: true });
      assertMultipleTexts('selected-territories', ['Europe', 'Latin America', territories['nepal']]);
    });

    it('no country should be available if filters search outside of term data', () => {
      fillInputs({
        rights: ['TV'],
        dateFrom: seller.term.duration.from,
        dateTo: new Date(seller.term.duration.to),
        exclusive: false,
      });
      assertAvailableCountries(69);
      //with a start before term beginning
      // force click because the input is hidden by mat-label since angular 15 migration
      get('dateFrom')
        .clear()
        .type(dateToMMDDYYYY(add(seller.term.duration.from, { days: -1 })), { force: true });
      assertAvailableCountries(0);

      // force click because the input is hidden by mat-label since angular 15 migration
      get('dateFrom').clear({ force: true }).type(dateToMMDDYYYY(seller.term.duration.from), { force: true }); //back to 69 available
      assertAvailableCountries(69);
      //with a end after end term
      get('dateTo')
        .clear()
        .type(dateToMMDDYYYY(add(seller.term.duration.to, { days: 1 })), { force: true });
      assertAvailableCountries(0);

      // force click because the input is hidden by mat-label since angular 15 migration
      get('dateTo').clear({ force: true }).type(dateToMMDDYYYY(seller.term.duration.to), { force: true }); //back to 69 available
      assertAvailableCountries(69);

      //with wrong rights (VOD)
      get('medias').click();
      get('TV').click('left');
      get('VOD').click('left');
      assertAvailableCountries(0);

      get('TV').click('left'); // back to 69 available
      get('VOD').click('left');
      escapeKey();
      assertAvailableCountries(69);

      //with wrong exclusivity
      get('exclusivity').click();
      get('exclusive').click();
      assertAvailableCountries(0);
    });
  });

  context('Single territory', () => {
    beforeEach(() => cy.visit(`/c/o/marketplace/title/${seller.movie.id}/avails/calendar`));

    it('user can select a period on the calendar', () => {
      get('missing-criteria').should('exist');
      fillInputs({
        territory: ['Europe'],
        rights: ['TV'],
        exclusive: false,
      });
      get('missing-criteria').should('not.exist');
      assertCalendarAvailabilities();
      selectCell({ row: 2, column: 1 });
      selectCell({ row: 2, column: 4 });
      assertCalendarPeriod();
    });

    it('no availabilty should appear if search criteria does not match term', () => {
      get('missing-criteria').should('exist');
      fillInputs({
        territory: ['Europe'],
        rights: ['TV'],
        exclusive: false,
      });
      get('missing-criteria').should('not.exist');
      assertCalendarAvailabilities();

      //with wrong countries
      get('territories').click();
      get('Europe').click('left');
      get('CIS').click('left');
      escapeKey();
      get('calendar').find('.available').should('not.exist');

      get('territories').click(); //back to 6 available
      get('CIS').click('left');
      get('Europe').click('left');
      escapeKey();
      get('calendar').find('.available').should('have.length', 6);

      //with wrong media
      get('medias').click();
      get('TV').click('left');
      get('VOD').click('left');
      escapeKey();
      get('calendar').find('.available').should('not.exist');

      get('medias').click(); //back to 6 available
      get('TV').click('left');
      get('VOD').click('left');
      escapeKey();
      get('calendar').find('.available').should('have.length', 6);

      //with wrong exclusivity
      get('exclusivity').click(); //back to 6 available
      get('exclusive').click();
      get('calendar').find('.available').should('not.exist');
    });

    it('checking the application flow when an offer is sent', () => {
      firestore.queryDelete({ collection: 'offers', field: 'buyerId', operator: '==', value: buyer.org.id });
      firestore.deleteNotifications([buyer.user.uid, seller.user.uid]);
      fillInputs({
        territory: ['Europe'],
        rights: ['TV'],
        exclusive: false,
      });
      selectCell({ row: 2, column: 1 });
      selectCell({ row: 2, column: 4 });
      // force click because the input is hidden by mat-label since angular 15 migration
      get('add-to-selection').click({ force: true });
      assertUrlIncludes('c/o/marketplace/selection');
      assertSelectionTableData();
      get('price').type('10000');
      get('validate-offer').click();
      get('specific-terms').type('E2E Specific terms');
      check('accept-terms');
      get('send-offer').click();
      assertUrlIncludes('c/o/marketplace/selection/congratulations');
      get('see-offers-and-deals').click();
      assertUrlIncludes('c/o/marketplace/offer');
      assertOfferTableData();
      get('notifications-link').should('contain', '1').click();
      assertUrlIncludes('c/o/marketplace/notifications');
      getOfferIdFromNotification().then((docId: string) => {
        get('notification-message').should('have.length', 1).and('contain', `Your offer ${docId} was successfully sent.`);
        checkOfferEmail('buyer', docId);
        getContractId(docId).then(contractId => checkOfferEmail('seller', contractId));
        checkOfferEmail('admin');
      });
      get('mark-as-read').click();
      get('notifications-link').should('not.contain', '1');
      get('already-read').should('exist');
      //connect as seller to verify his notification
      connectUser(seller.user.email);
      get('notifications-link').should('contain', '1').click();
      get('notification-message')
        .should('have.length', 1)
        .and('contain', `${buyer.org.name} sent an offer for ${seller.movie.title.international}.`);
      get('mark-as-read').click();
      get('notifications-link').should('not.contain', '1');
      get('already-read').should('exist');
    });
  });
});

//* FUNCTIONS *//

function fillInputs({
  territory, //only for single territory UI
  rights,
  dateFrom, //multiple territory UI
  dateTo, //multiple territory UI
  exclusive,
}: {
  territory?: (TerritoryGroup | keyof typeof territories)[];
  rights: (MediaGroup | keyof typeof medias)[];
  dateFrom?: Date;
  dateTo?: Date;
  exclusive: boolean;
}) {
  // force click because the input is hidden by mat-label since angular 15 migration
  if (dateFrom) get('dateFrom').clear().type(dateToMMDDYYYY(dateFrom), { force: true });
  if (dateTo) get('dateTo').clear().type(dateToMMDDYYYY(dateTo), { force: true });
  if (territory) {
    get('territories').click();
    for (const option of territory) {
      get(option).click('left');
    }
    escapeKey();
  }
  get('medias').click();
  for (const right of rights) get(right).click('left');
  escapeKey();
  get('exclusivity').click();
  get(exclusive ? 'exclusive' : 'non-exclusive').click();
}

function selectAllAvailable() {
  assertAvailableCountries(69);
  /**
   * TODO #9702 (@nx/cypress): Nesting Cypress commands in a should assertion now throws.
   * You should use .then() to chain commands instead.
   * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
   **/
  cy.get('[fill="#7795ff"]') //each available country is a 'path' filled with this color
    .should('have.length', 69)
    .each(territory => cy.wrap(territory).click({ force: true }));
}

function assertModalTerritories() {
  const modal = cy.get('global-modal');
  for (const territory of seller.term.territories) {
    //Holy See and Vatican is the same territory, and Vatican City prevails when clicking on its coordinates
    if (territory !== 'holy-see') modal.should('contain', `${territories[territory]}`);
  }
  modal.should('contain', 'Europe').and('contain', 'Latin America').and('contain', 'Asia');
  // force click because the input is hidden by mat-label since angular 15 migration
  get('close').click({ force: true });
}

function assertAvailableCountries(number: number) {
  const availablecountries = cy.get('[color="#7795ff"]'); //we can target available countries with the color passed to map-feature
  return number ? availablecountries.should('have.length', number) : availablecountries.should('not.exist');
}

function assertSelectedMedias(medias: string | string[]) {
  if (!Array.isArray(medias)) medias = [medias];
  const selector = get('selected-medias').eq(0);
  selector.click();
  for (const media of medias) {
    selector.should('contain', media);
  }
  selector.click();
}

function assertCalendarAvailabilities() {
  get('calendar').find('.available').should('have.length', 6); //6 available months with related class
  get('calendar').find('.empty').should('have.length', 114); //114 from the 120 months (10 years) with 'empty' class
  for (let column = 0; column < 5; column++) {
    //checking that the 6 first months of the second row (next year) are available
    //(therefore proving the 114 other months have 'empty' class)
    get('calendar').find('tr').eq(2).find('td').eq(column).should('have.class', 'available');
  }
}

function selectCell({ row, column }: { row: number; column: number }) {
  return get('calendar').find('tr').eq(row).find('td').eq(column).click();
}

function assertCalendarPeriod() {
  get('calendar').find('tr').eq(2).find('td').eq(0).should('have.class', 'available');
  get('calendar').find('tr').eq(2).find('td').eq(1).should('have.class', 'selected').and('contain', 'start');
  get('calendar').find('tr').eq(2).find('td').eq(2).should('have.class', 'selected');
  get('calendar').find('tr').eq(2).find('td').eq(3).should('have.class', 'selected');
  get('calendar').find('tr').eq(2).find('td').eq(4).should('have.class', 'selected').and('contain', 'end');
  get('calendar').find('tr').eq(2).find('td').eq(0).should('have.class', 'available');
}

function assertSelectionTableData() {
  const nextYear = new Date().getFullYear() + 1;
  assertTableRowData(0, [`02/01/${nextYear}`, `05/01/${nextYear}`, 'Europe', 'TV', 'No']);
}

function assertOfferTableData() {
  const today = dateToMMDDYYYY(new Date());
  get('all-offers').should('contain', '(1)');
  get('offers').should('contain', '(1)');
  get('ongoing-deals').should('contain', '(0)');
  get('past-deals').should('contain', '(0)');
  get('row_0_col_0').invoke('text').should('have.length', 10);
  assertTableRowData(0, [
    `${buyer.org.name.substring(0, 3).toUpperCase()}-`,
    today,
    '1',
    seller.movie.title.international,
    'YES',
    '10,000.00',
    'New',
  ]);
}

function getOfferIdFromNotification() {
  return firestore
    .queryData({ collection: 'notifications', field: 'toUserId', operator: '==', value: buyer.user.uid })
    .then((notifications: Notification[]) => {
      expect(notifications).to.have.lengthOf(1);
      return notifications[0].docId;
    });
}

function getContractId(offerId: string) {
  return firestore
    .queryData({ collection: 'contracts', field: 'offerId', operator: '==', value: offerId })
    .then((contracts: Contract[]) => {
      expect(contracts).to.have.lengthOf(1);
      return contracts[0].id;
    });
}

function checkOfferEmail(user: 'buyer' | 'seller' | 'admin', docId?: string) {
  const mailData = {
    buyer: {
      recipient: buyer.user.email,
      subject: `Your offer ${docId} was successfully submitted`,
      linkText: 'Offer',
      redirect: `c/o/marketplace/offer/${docId}`,
    },
    seller: {
      recipient: seller.user.email,
      subject: `You just received an offer for ${seller.movie.title.international} from ${buyer.org.name}`,
      linkText: 'discussions',
      redirect: `c/o/dashboard/sales/${docId}`,
    },
    admin: {
      recipient: e2eSupportEmail,
      subject: `${buyer.org.name} created a new Offer.`,
    },
  };

  interceptEmail(`to:${mailData[user].recipient}`).then(mail => {
    const subject = getSubject(mail);
    expect(subject).to.eq(mailData[user].subject);
    if (user !== 'admin') {
      const body = getTextBody(mail);
      const links = getBodyLinks(body);
      cy.request({ url: links[mailData[user].linkText], failOnStatusCode: false }).then(response => {
        expect(response.redirects).to.have.lengthOf(1);
        const redirect = response.redirects[0];
        expect(redirect).to.include('302');
        expect(redirect).to.include(mailData[user].redirect);
      });
    }
    return gmail.deleteEmail(mail.id);
  });
}
