import { territories, MediaGroup, medias, TerritoryGroup, Notification, Contract } from '@blockframes/model';
import {
  // plugins
  adminAuth,
  algolia,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  assertUrlIncludes,
  syncMovieToAlgolia,
  escapeKey,
  check,
  connectOtherUser,
  assertTableRowData,
  // cypress tasks
  interceptEmail,
  deleteEmail,
  // helpers
  dateToMMDDYYYY,
} from '@blockframes/testing/cypress/browser';
import { buyer, seller } from '../../fixtures/marketplace/deal-create-offer';
import { supportMailosaur } from '@blockframes/utils/constants';
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
    syncMovieToAlgolia(seller.movie.id);
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
      get('select-all').click();
      get('selected-territories')
        .should('contain', 'Europe')
        .and('contain', 'Latin America')
        .and('contain', territories['nepal']);
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
      get('dateFrom')
        .clear()
        .type(dateToMMDDYYYY(add(seller.term.duration.from, { days: -1 })));
      assertAvailableCountries(0);

      get('dateFrom').clear().type(dateToMMDDYYYY(seller.term.duration.from)); //back to 69 available
      assertAvailableCountries(69);
      //with a end after end term
      get('dateTo')
        .clear()
        .type(dateToMMDDYYYY(add(seller.term.duration.to, { days: 1 })));
      assertAvailableCountries(0);

      get('dateTo').clear().type(dateToMMDDYYYY(seller.term.duration.to)); //back to 69 available
      assertAvailableCountries(69);

      //with wrong rights (VOD)
      get('medias').click();
      get('TV').click();
      get('VOD').click();
      assertAvailableCountries(0);

      get('TV').click(); // back to 69 available
      get('VOD').click();
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
      get('Europe').click();
      get('CIS').click();
      escapeKey();
      get('calendar').find('.available').should('not.exist');

      get('territories').click(); //back to 6 available
      get('CIS').click();
      get('Europe').click();
      escapeKey();
      get('calendar').find('.available').should('have.length', 6);

      //with wrong media
      get('medias').click();
      get('TV').click();
      get('VOD').click();
      escapeKey();
      get('calendar').find('.available').should('not.exist');

      get('medias').click(); //back to 6 available
      get('TV').click();
      get('VOD').click();
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
      get('add-to-selection').click();
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
      connectOtherUser(seller.user.email);
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
  if (territory) {
    get('territories').click();
    for (const option of territory) {
      get(option).click();
    }
    escapeKey();
  }
  get('medias').click();
  for (const right of rights) get(right).click();
  escapeKey();
  if (dateFrom) get('dateFrom').clear().type(dateToMMDDYYYY(dateFrom));
  if (dateTo) get('dateTo').clear().type(dateToMMDDYYYY(dateTo));
  get('exclusivity').click();
  get(exclusive ? 'exclusive' : 'non-exclusive').click();
}

function selectAllAvailable() {
  assertAvailableCountries(69);
  cy.get('[fill="#7795ff"]') //each available country is a 'path' filled with this color
    .should('have.length', 69)
    .each(territory => cy.wrap(territory).click({ force: true }));
}

function assertModalTerritories() {
  const modal = cy.get('global-modal');
  for (const territory of seller.term.territories) {
    //Holy See and Vatican is the same territory, and Holy See prevails when clicking on its coordinates
    if (territory !== 'vatican') modal.should('contain', `${territories[territory]}`);
  }
  modal.should('contain', 'Europe').and('contain', 'Latin America').and('contain', 'Asia');
  modal.find('button').click(); //the only existing button is to close the modal
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
      linkText: 'See Offer',
      redirect: `c/o/marketplace/offer/${docId}`,
    },
    seller: {
      recipient: seller.user.email,
      subject: `You just received an offer for ${seller.movie.title.international} from ${buyer.org.name}`,
      linkText: 'Start discussions',
      redirect: `c/o/dashboard/sales/${docId}`,
    },
    admin: {
      recipient: supportMailosaur,
      subject: `${buyer.org.name} created a new Offer.`,
    },
  };

  interceptEmail({ sentTo: mailData[user].recipient }).then(mail => {
    expect(mail.subject).to.eq(mailData[user].subject);
    if (user !== 'admin') {
      const offerLink = mail.html.links.filter(link => link.text === mailData[user].linkText)[0];
      cy.request({ url: offerLink.href, failOnStatusCode: false }).then(response => {
        expect(response.redirects).to.have.lengthOf(1);
        const redirect = response.redirects[0];
        expect(redirect).to.include('302');
        expect(redirect).to.include(mailData[user].redirect);
      });
    }
    return deleteEmail(mail.id);
  });
}
