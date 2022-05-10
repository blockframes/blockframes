import {
  auth,
  get,
  getByClass,
  cypress,
  firebase,
} from '@blockframes/testing/cypress/browser';
import { Organization, User, Movie } from '@blockframes/model';

describe('Meeting creation', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    firebase.getScreeningData({ userType: 'admin' }).then((data: { org: Organization, user: User, movies: Movie[] }) => {
      firebase.deleteAllSellerEvents(data.user.uid);
      cypress.wrapFeedbackData(data);
      cy.visit('');
      cypress.acceptIfCookies();
      auth.loginWithEmailAndPassword(data.user.email);
      cy.visit('');
    });
    get('my-events').click();
  });

  it('ending time of a meeting cannot precede starting time', function () {
    cy.then(function () {
      const randomDay = Math.floor(Math.random() * 7);
      cypress.goToNextWeek();
      cypress.selectFirstSlotOfDay(randomDay);
      get('event-start').find('[type=time]').click();
      cy.contains('12:00').click();
      get('event-end').find('[type=time]').click();
      cy.contains('11:30').click();
      getByClass('mat-error').should('have.length', 2);
    });
  });
});
