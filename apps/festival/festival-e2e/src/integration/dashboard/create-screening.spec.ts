import {
  auth,
  assertUrlIncludes,
  get,
  cypress,
  firebase,
  EventSlot,
  createFutureSlot,
} from '@blockframes/testing/cypress/browser';
import { Organization, User, Movie, EventTypes } from '@blockframes/model';

describe('Screening creation', () => {
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

  it('add a future public screening event', function () {
    // below line allow us to use 'this' instead of calling object with 'get('@alias')' for wrapped objects
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType: EventTypes = 'screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        accessibility: 'public',
        isSecret: false,
        eventTitle,
        movieTitle,
        dataToCheck: {
          movieTitles,
          calendarSlot: futureSlot,
        },
      });
      firebase.getRandomUser({ app: 'festival', access: { marketplace: true, dashboard: false }, userType: 'member' })
        .then((user: User) => {
          auth.clearBrowserAuth();
          console.log('user : ', user)
          cypress.connectUser(user.email);
          get('Screenings').click();
          assertUrlIncludes('c/o/marketplace/event');
          cypress.searchInEvents({ title: eventTitle, accessibility: 'public screening', expected: true });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('can add a future protected screening event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType: EventTypes = 'screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin protected screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        accessibility: 'protected',
        isSecret: false,
        eventTitle,
        movieTitle,
        dataToCheck: {
          movieTitles,
          calendarSlot: futureSlot,
        },
      });
      firebase.getRandomUser({ app: 'festival', access: { marketplace: true, dashboard: false }, userType: 'member' })
        .then((user: User) => {
          auth.clearBrowserAuth();
          console.log('user : ', user)
          cypress.connectUser(user.email);
          get('Screenings').click();
          assertUrlIncludes('c/o/marketplace/event');
          cypress.searchInEvents({ title: eventTitle, accessibility: 'protected screening', expected: true });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('can add a future private screening event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType: EventTypes = 'screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin private screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        accessibility: 'private',
        isSecret: false,
        eventTitle,
        movieTitle,
        dataToCheck: {
          movieTitles,
          calendarSlot: futureSlot,
        },
      });
      firebase.getRandomUser({ app: 'festival', access: { marketplace: true, dashboard: false }, userType: 'member' })
        .then((user: User) => {
          auth.clearBrowserAuth();
          cypress.connectUser(user.email);
          get('Screenings').click();
          assertUrlIncludes('c/o/marketplace/event');
          cypress.searchInEvents({ title: eventTitle, accessibility: 'private screening', expected: true });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('can add a future public and secret screening event', function () {
    cy.then(function () {
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventType: EventTypes = 'screening';
      // creation of a dummy event in order to assess that the secret one is not visible
      const dummySlot = createFutureSlot();
      const dummyEventTitle = `Dummy event`;
      cypress.selectSlot(dummySlot);
      cypress.fillPopinForm({ eventType, eventTitle: dummyEventTitle });
      cypress.fillScreeningForm({
        accessibility: 'public',
        isSecret: false,
        eventTitle: dummyEventTitle,
        movieTitle,
        dataToCheck: {
          movieTitles,
          calendarSlot: dummySlot,
        },
      });
      // dummy event creation finished
      let secretSlot: EventSlot;
      do {
        secretSlot = createFutureSlot();
      } while (dummySlot === secretSlot);
      const eventTitle = `Admin public and secret screening / d${secretSlot.day}, h${secretSlot.hours}:${secretSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(secretSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        accessibility: 'public',
        isSecret: true,
        eventTitle,
        movieTitle,
        dataToCheck: {
          movieTitles,
          calendarSlot: secretSlot,
        },
      });
      firebase.getRandomUser({ app: 'festival', access: { marketplace: true, dashboard: false }, userType: 'member' })
        .then((user: User) => {
          auth.clearBrowserAuth();
          console.log('user : ', user)
          cypress.connectUser(user.email);
          get('Screenings').click();
          assertUrlIncludes('c/o/marketplace/event');
          cypress.searchInEvents({ title: eventTitle, expected: false });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

});

describe('Create an event as member', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    firebase.getScreeningData({ userType: 'member' })
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

  it('A member can add a future public screening event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType: EventTypes = 'screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Member public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        accessibility: 'public',
        isSecret: false,
        eventTitle,
        movieTitle,
        dataToCheck: {
          movieTitles,
          calendarSlot: futureSlot,
        },
      });
      firebase.getRandomUser({ app: 'festival', access: { marketplace: true, dashboard: false }, userType: 'member' })
        .then((user: User) => {
          auth.clearBrowserAuth();
          cypress.connectUser(user.email);
          get('Screenings').click();
          assertUrlIncludes('c/o/marketplace/event');
          cypress.searchInEvents({ title: eventTitle, accessibility: 'public screening', expected: true });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });
});

describe('Testing warning chip', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
  });

  it('A warning chip warns in case of a screening for a movie without screener', function () {
    firebase.getScreeningData({ userType: 'member', moviesWithScreener: false })
      .then((data: { org: Organization; user: User; movies: Movie[] }) => {
        firebase.deleteAllSellerEvents(data.user.uid);
        cypress.wrapFeedbackData(data);
        cy.visit('');
        cypress.acceptIfCookies();
        auth.loginWithEmailAndPassword(data.user.email);
        cy.visit('');
      });
    get('my-events').click();
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType: EventTypes = 'screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        accessibility: 'public',
        isSecret: false,
        eventTitle,
        movieTitle,
        dataToCheck: {
          calendarSlot: futureSlot,
        },
      });
      get('movie-title').click();
      get('warning-chip').should('exist');
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('No warning chip is present in case of a screening for a movie with screener', function () {
    firebase.getScreeningData({ userType: 'member', moviesWithScreener: true })
      .then((data: { org: Organization; user: User; movies: Movie[] }) => {
        firebase.deleteAllSellerEvents(data.user.uid);
        cypress.wrapFeedbackData(data);
        cy.visit('');
        cypress.acceptIfCookies();
        auth.loginWithEmailAndPassword(data.user.email);
        cy.visit('');
      });
    get('my-events').click();
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType: EventTypes = 'screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        accessibility: 'public',
        isSecret: false,
        eventTitle,
        movieTitle,
        dataToCheck: {
          calendarSlot: futureSlot,
        },
      });
      get('movie-title').click();
      get('warning-chip').should('not.exist');
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });
});
