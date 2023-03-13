import {
  // plugins
  adminAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  connectUser,
  escapeKey,
  dateToMMDDYYYY,
  findIn,
  assertUrlIncludes,
  assertMultipleTexts,
  snackbarShould,
  // avails functions
  selectTerritories,
  selectMedias,
  selectDates,
  selectNonExclusive,
  selectExclusive,
  assertInputValue,
} from '@blockframes/testing/cypress/browser';
import { Term } from '@blockframes/model';
import { buyer, seller } from '../../fixtures/dashboard/avails-search';
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
  [`movies/${seller.movies[0].id}`]: seller.movies[0],
  [`movies/${seller.movies[1].id}`]: seller.movies[1],
  [`movies/${seller.movies[2].id}`]: seller.movies[2],
  [`permissions/${seller.orgPermissions.id}/documentPermissions/${seller.moviePermissions[0].id}`]: seller.moviePermissions[0],
  [`permissions/${seller.orgPermissions.id}/documentPermissions/${seller.moviePermissions[1].id}`]: seller.moviePermissions[1],
  [`permissions/${seller.orgPermissions.id}/documentPermissions/${seller.moviePermissions[2].id}`]: seller.moviePermissions[2],
  [`contracts/${seller.contracts[0].id}`]: seller.contracts[0],
  [`contracts/${seller.contracts[1].id}`]: seller.contracts[1],
  [`contracts/${seller.contracts[2].id}`]: seller.contracts[2],
  [`terms/${seller.terms[0].id}`]: seller.terms[0],
  [`terms/${seller.terms[1].id}`]: seller.terms[1],
  [`terms/${seller.terms[2].id}`]: seller.terms[2],
};

const { movies, terms } = seller;

describe('Dashboard avails search', () => {
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
    connectUser(seller.user.email);
  });

  beforeEach(() => {
    cy.visit('c/o/dashboard/avails');
  });

  context('Avails main page', () => {
    it('The 3 movies appears on avails main page', () => {
      get('row_0_col_0').should('contain', movies[0].title.international);
      get('row_1_col_0').should('contain', movies[1].title.international);
      get('row_2_col_0').should('contain', movies[2].title.international);
    });

    it('Can find first movie only', () => {
      firstMovieFilters();
    });

    it('Can find second movie only', () => {
      selectTerritories('Europe');
      selectMedias('Festivals');
      selectDates(terms[1].duration.from, terms[1].duration.to);
      selectNonExclusive();
      get('row_0_col_0').should('contain', movies[1].title.international);
      get('row_1_col_0').should('not.exist');
    });

    it('Can find third movie only', () => {
      selectTerritories('North America');
      selectMedias('TV');
      selectDates(terms[2].duration.from, terms[2].duration.to);
      selectExclusive();
      get('row_0_col_0').should('contain', movies[2].title.international);
      get('row_1_col_0').should('not.exist');
    });

    it('Can find first and second movies with festival and common dates', () => {
      selectTerritories('Europe');
      selectMedias('Festivals');
      selectDates(terms[1].duration.from, terms[0].duration.to);
      selectNonExclusive();
      get('row_0_col_0').should('contain', movies[0].title.international);
      get('row_1_col_0').should('contain', movies[1].title.international);
      get('row_2_col_0').should('not.exist');
    });

    context('Filters discard as intended', () => {
      it('Territories', () => {
        firstMovieFilters();
        selectTerritories('CIS');
        get('empty').should('exist');
      });
      it('Medias', () => {
        firstMovieFilters();
        selectMedias('VOD');
        get('empty').should('exist');
      });
      it('From date', () => {
        firstMovieFilters();
        get('dateFrom')
          .clear()
          .type(dateToMMDDYYYY(sub(terms[0].duration.from, { days: 1 })));
        get('empty').should('exist');
      });
      it('To date', () => {
        firstMovieFilters();
        get('dateTo')
          .clear()
          .type(dateToMMDDYYYY(add(terms[0].duration.to, { days: 1 })));
        get('empty').should('exist');
      });
      it('Exclusivity', () => {
        firstMovieFilters();
        selectExclusive();
        get('empty').should('exist');
      });
    });
  });

  context('Checking avails links', () => {
    it('can find the available territories in the map component', () => {
      get('row_0_col_0').should('contain', movies[0].title.international);
      findIn('row_0_col_4', 'map').click();
      assertUrlIncludes(`dashboard/avails/${movies[0].id}/map`);
      cy.get('[color="#7795ff"]').should('not.exist');
      selectMedias('TV');
      cy.get('[color="#7795ff"]').should('not.exist');
      selectDates(terms[0].duration.from, terms[0].duration.to);
      cy.get('[color="#7795ff"]').should('not.exist');
      selectNonExclusive();
      cy.get('[color="#7795ff"]').should('have.length', terms[0].territories.length);
    });

    it('can find the available months in the calendar component', () => {
      get('row_0_col_0').should('contain', movies[0].title.international);
      // in Cypress, the calendar icon leads to the map component, but it works manually => using url instead
      findIn('row_0_col_4', 'calendar').should('have.attr', 'href', `/c/o/dashboard/avails/${movies[0].id}/calendar`);
      cy.visit(`/c/o/dashboard/avails/${movies[0].id}/calendar`);
      assertUrlIncludes(`dashboard/avails/${movies[0].id}/calendar`);
      cy.get('.available').should('not.exist');
      selectTerritories('Europe');
      cy.get('.available').should('not.exist');
      selectMedias('TV');
      cy.get('.available').should('not.exist');
      selectNonExclusive();
      cy.get('.available').should('have.length', 7);
      cy.get('tr')
        .eq(2)
        .find('td')
        .then($cells => {
          $cells
            .toArray()
            .forEach((cell, index) =>
              index < 7 ? expect(cell).to.have.class('available') : expect(cell).to.not.have.class('available')
            );
        });
    });

    it('can modify the avail via manage component', () => {
      get('row_0_col_0').should('contain', movies[0].title.international);
      // same as previous 'it' about using url
      findIn('row_0_col_4', 'manage').should('have.attr', 'href', `/c/o/dashboard/avails/select/${movies[0].id}/manage`);
      cy.visit(`/c/o/dashboard/avails/select/${movies[0].id}/manage`);
      assertUrlIncludes(`/c/o/dashboard/avails/select/${movies[0].id}/manage`);
      // checking content
      get('territories').should('contain', 'Europe');
      assertMultipleTexts('medias', ['TV', 'Rental', 'Festivals']);
      get('dateFrom')
        .invoke('val')
        .then((val: string) => expect(dateToMMDDYYYY(new Date(val))).to.eq(dateToMMDDYYYY(terms[0].duration.from)));
      get('dateTo')
        .invoke('val')
        .then((val: string) => expect(dateToMMDDYYYY(new Date(val))).to.eq(dateToMMDDYYYY(terms[0].duration.to)));
      get('exclusivity').should('contain', 'Non exclusive');
      get('row_0_col_0').should('contain', dateToMMDDYYYY(terms[0].duration.from));
      get('row_0_col_1').should('contain', dateToMMDDYYYY(terms[0].duration.to));
      get('row_0_col_2').should('contain', 'Europe');
      get('row_0_col_3').click();
      assertMultipleTexts('modal', ['Pay TV', 'Free TV', 'Pay Per View', 'Rental', 'Festival']);
      get('row_0_col_4').should('contain', 'No');
      escapeKey();
      // edit term
      selectTerritories('france');
      selectMedias('Festivals');
      selectDates(add(terms[0].duration.from, { months: 1 }), sub(terms[0].duration.to, { months: 1 }));
      selectExclusive();
      get('save').click();
      snackbarShould('contain', '1 Terms updated.');
      // check db
      firestore.get<Term>(`terms/${terms[0].id}`).then(term =>
        expect(term).to.deep.include({
          duration: {
            from: toFirebaseTimestamp(add(terms[0].duration.from, { months: 1 })),
            to: toFirebaseTimestamp(sub(terms[0].duration.to, { months: 1 })),
          },
          exclusive: true,
          medias: terms[0].medias.filter(media => media !== 'festival'),
          territories: terms[0].territories.filter(country => country !== 'france'),
        })
      );
    });
  });
});

//* Functions

const toFirebaseTimestamp = (date: Date) => ({ _nanoseconds: 0, _seconds: date.getTime() / 1000 });

function firstMovieFilters() {
  selectTerritories('Europe');
  selectMedias('TV');
  selectDates(terms[0].duration.from, terms[0].duration.to);
  selectNonExclusive();
  get('row_0_col_0').should('contain', movies[0].title.international);
  get('row_1_col_0').should('not.exist');
}
