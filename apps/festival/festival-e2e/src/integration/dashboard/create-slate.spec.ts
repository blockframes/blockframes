import {
  auth,
  get,
  cypress,
  firebase,
  createFutureSlot,
} from '@blockframes/testing/cypress/browser';
import { Organization, User, Movie } from '@blockframes/model';

describe('Slate creation', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    firebase.getScreeningData({ userType: 'admin' })
      .then((data: { org: Organization; user: User; movies: Movie[] }) => {
        firebase.deleteAllSellerEvents(data.user.uid);
        cypress.wrapFeedbackData(data);
        cy.visit('');
        cypress.acceptIfCookies();
        auth.loginWithEmailAndPassword(data.user.email);
        cy.visit('');
      });
    get('my-events').click();
  });

  it('can add a future public slate event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Slate';
      const eventTitle = `Admin public slate / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes}`;
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const shuffledTitles = [...movieTitles].sort(() => 0.5 - Math.random());
      const randomSelection = Math.floor(Math.random() * (movieTitles.length - 1)) + 1;
      const selectedTitles = shuffledTitles.slice(0, randomSelection);
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillSlateForm({
        eventPrivacy: 'public',
        isSecret: false,
        eventTitle,
        selectedTitles,
        dataToCheck: {
          calendarSlot: futureSlot,
        },
      });

      //TODO : after May release, slates should be visible with the screenings => add the adequate check (#8220)

      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('can add a future public and secret slate event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Slate';
      const eventTitle = `Admin public and secret slate / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes}`;
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const shuffledTitles = [...movieTitles].sort(() => 0.5 - Math.random());
      const randomSelection = Math.floor(Math.random() * (movieTitles.length - 1)) + 1;
      const selectedTitles = shuffledTitles.slice(0, randomSelection);
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillSlateForm({
        eventPrivacy: 'public',
        isSecret: true,
        eventTitle,
        selectedTitles,
        dataToCheck: {
          calendarSlot: futureSlot,
        },
      });

      //TODO : after May release, slates should be visible with the screenings => add the adequate check (#8220)

      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

});
