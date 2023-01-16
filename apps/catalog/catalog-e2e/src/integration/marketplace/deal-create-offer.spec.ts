import { territories, MediaGroup, medias, TerritoryGroup, Notification, User } from '@blockframes/model';
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
  // cypress tasks
  interceptEmail,
} from '@blockframes/testing/cypress/browser';
import { buyer, seller } from '../../fixtures/marketplace/deal-create-offer';
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
    firestore.deleteOffers(buyer.org.id);
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
        .type(add(seller.term.duration.from, { days: -1 }).toLocaleDateString('en-US'));
      assertAvailableCountries(0);

      get('dateFrom').clear().type(seller.term.duration.from.toLocaleDateString('en-US')); //back to 69 available
      assertAvailableCountries(69);
      //with a end after end term
      get('dateTo')
        .clear()
        .type(add(seller.term.duration.to, { days: 1 }).toLocaleDateString('en-US'));
      assertAvailableCountries(0);

      get('dateTo').clear().type(seller.term.duration.to.toLocaleDateString('en-US')); //back to 69 available
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
      firestore.deleteOffers(buyer.org.id);
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
      getNotificationId().then((docId: string) => {
        get('notification-message').should('have.length', 1).and('contain', `Your offer ${docId} was successfully sent.`);
        checkOfferEmail(buyer.user, docId);
        checkOfferEmail(seller.user, docId);
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
  if (dateFrom) get('dateFrom').clear().type(dateFrom.toLocaleDateString('en-US'));
  if (dateTo) get('dateTo').clear().type(dateTo.toLocaleDateString('en-US'));
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
  get('selected-medias').click();
  for (const media of medias) {
    get('selected-medias').should('contain', media);
  }
  get('selected-medias').click();
}

function assertCalendarAvailabilities() {
  get('calendar').find('.available').should('have.length', 6);
  get('calendar').find('.empty').should('have.length', 114);
  for (let column = 0; column < 5; column++) {
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
  get('row_0_col_0').should('contain', `2/1/${nextYear}`);
  get('row_0_col_1').should('contain', `5/1/${nextYear}`);
  get('row_0_col_2').should('contain', 'Europe');
  get('row_0_col_3').should('contain', 'TV');
  get('row_0_col_4').should('contain', 'No');
}

function assertOfferTableData() {
  const today = new Date().toLocaleDateString('en-US');
  get('all-offers').should('contain', '(1)');
  get('offers').should('contain', '(1)');
  get('ongoing-deals').should('contain', '(0)');
  get('past-deals').should('contain', '(0)');
  get('row_0_col_0').should('contain', `${buyer.org.name.substring(0, 3).toUpperCase()}-`);
  get('row_0_col_0').invoke('text').should('have.length', 10);
  get('row_0_col_1').should('contain', today);
  get('row_0_col_2').should('contain', '1');
  get('row_0_col_3').should('contain', seller.movie.title.international);
  get('row_0_col_4').should('contain', 'YES');
  get('row_0_col_5').should('contain', '10,000.00');
  get('row_0_col_6').should('contain', 'New');
}

function getNotificationId() {
  return firestore
    .queryData({ collection: 'notifications', field: 'toUserId', operator: '==', value: buyer.user.uid })
    .then((notifications: Notification[]) => {
      expect(notifications).to.have.lengthOf(1);
      return notifications[0].docId;
    });
}

function checkOfferEmail(user: User, docId: string) {
  const isUserBuyer = user.uid.includes('buyer');
  interceptEmail({ sentTo: user.email }).then(mail => {
    expect(mail.subject).to.eq(
      isUserBuyer
        ? `Your offer ${docId} was successfully submitted`
        : `You just received an offer for ${seller.movie.title.international} from ${buyer.org.name}`
    );
    const offerLinkPresent = mail.html.links.some(link => link.text === (isUserBuyer ? 'See Offer' : 'Start discussions'));
    expect(offerLinkPresent).to.be.true;
  });
}
