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
} from '@blockframes/testing/cypress/browser';
import { Media, MediaGroup, Territory, TerritoryGroup } from '@blockframes/model';
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

  context('Avails main page', () => {
    beforeEach(() => {
      cy.visit('c/o/dashboard/avails');
    });

    it('The 3 movies appears on avails main page', () => {
      get('row_0_col_0').should('contain', movies[0].title.international);
      get('row_1_col_0').should('contain', movies[1].title.international);
      get('row_2_col_0').should('contain', movies[2].title.international);
    });

    it('Can find first movie only', () => {
      firestMovieFilters();
    });

    it('Can find second movie only', () => {
      selectTerritories('Europe');
      selectMedias('festival');
      selectDates(terms[1].duration.from, terms[1].duration.to);
      selectNonExclusive();
      get('row_1_col_0').should('not.exist');
      get('row_0_col_0').should('contain', movies[1].title.international);
    });

    it('Can find third movie only', () => {
      selectTerritories('North America');
      selectMedias('TV');
      selectDates(terms[2].duration.from, terms[2].duration.to);
      selectExclusive();
      get('row_1_col_0').should('not.exist');
      get('row_0_col_0').should('contain', movies[2].title.international);
    });

    it('Can find first and second movies with festival and common dates', () => {
      selectTerritories('Europe');
      selectMedias('festival');
      selectDates(terms[1].duration.from, terms[0].duration.to);
      selectNonExclusive();
      get('row_2_col_0').should('not.exist');
      get('row_0_col_0').should('contain', movies[0].title.international);
      get('row_1_col_0').should('contain', movies[1].title.international);
    });

    context('Filters discard as intended', () => {
      it('Teritories', () => {
        firestMovieFilters();
        selectTerritories('CIS');
        get('empty').should('exist');
      });
      it('Medias', () => {
        firestMovieFilters();
        selectMedias('VOD');
        get('empty').should('exist');
      });
      it('From date', () => {
        firestMovieFilters();
        get('dateFrom')
          .clear()
          .type(dateToMMDDYYYY(sub(terms[0].duration.from, { days: 1 })));
        get('empty').should('exist');
      });
      it('To date', () => {
        firestMovieFilters();
        get('dateTo')
          .clear()
          .type(dateToMMDDYYYY(add(terms[0].duration.to, { days: 1 })));
        get('empty').should('exist');
      });
      it('Exclusivity', () => {
        firestMovieFilters();
        selectExclusive();
        get('empty').should('exist');
      });
    });
  });
});

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

function selectDates(from: Date, to: Date) {
  get('dateFrom').clear().type(dateToMMDDYYYY(from));
  get('dateTo').clear().type(dateToMMDDYYYY(to));
}

function selectNonExclusive() {
  get('exclusivity').click();
  get('non-exclusive').click();
}

function selectExclusive() {
  get('exclusivity').click();
  get('exclusive').click();
}

function firestMovieFilters() {
  selectTerritories('Europe');
  selectMedias('TV');
  selectDates(terms[0].duration.from, terms[0].duration.to);
  selectNonExclusive();
  get('row_1_col_0').should('not.exist');
  get('row_0_col_0').should('contain', movies[0].title.international);
}
