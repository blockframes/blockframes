import { auth, get, getInList, getByClass, getAllStartingWith, assertUrlIncludes } from '@blockframes/testing/cypress/browser';
import { Organization, User, Movie, UserRole } from '@blockframes/model';
import { App, ModuleAccess } from '@blockframes/utils/apps';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';
import { startOfWeek, add, isPast, isFuture } from 'date-fns';

describe('Create an event as admin', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    firebase.getScreeningData({ userType: 'admin' })
      .then((data: { org: Organization; user: User; movies: Movie[] }) => {
        firebase.deleteAllSellerEvents(data.user.uid);
        cypress.wrapFeedbackData(data);
        cy.visit('');
        cy.contains('Accept cookies').click();
        auth.loginWithEmailAndPassword(data.user.email);
        cy.visit('');
      });
    get('my-events').click();
  });

  //temporary it, used for testing functions
  it.skip('For testing purpose', () => {
    const pastSlot = createPastSlot();
    const futureSlot = createFutureSlot();
    cy.log('now', new Date().getDay(), new Date().getHours(), new Date().getMinutes());
    cy.log('pastSlot' + JSON.stringify(pastSlot));
    cy.log('futureSlot', JSON.stringify(futureSlot));
  });

  it('The calendar shows current week', () => {
    const currentWeekDays = getCurrentWeekDays();
    getByClass('cal-header').each((header, index) => {
      expect(header).to.contain(currentWeekDays[index].day);
      expect(header).to.contain(currentWeekDays[index].date);
    });
  });

  it('An admin can add a future public screening event', function () {
    // below line allow us to use 'this' instead of calling object with 'get('@alias')' for wrapped objects
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        eventPrivacy: 'public',
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
          cypress.searchInEvents({ title: eventTitle, type: 'public screening', expected: true });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can add a future protected screening event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin protected screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        eventPrivacy: 'protected',
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
          cypress.searchInEvents({ title: eventTitle, type: 'protected screening', expected: true });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can add a future private screening event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin private screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        eventPrivacy: 'private',
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
          cypress.searchInEvents({ title: eventTitle, type: 'private screening', expected: true });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can add a future public and secret screening event', function () {
    cy.then(function () {
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventType = 'Screening';
      // creation of a dummy event in order to assess that the secret one is not visible
      const dummySlot = createFutureSlot();
      const dummyEventTitle = `Dummy event`;
      cypress.selectSlot(dummySlot);
      cypress.fillPopinForm({ eventType, eventTitle: dummyEventTitle });
      cypress.fillScreeningForm({
        eventPrivacy: 'public',
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
        eventPrivacy: 'public',
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
          cypress.connectUser(user.email);
          get('Screenings').click();
          assertUrlIncludes('c/o/marketplace/event');
          cypress.searchInEvents({ title: eventTitle, expected: false });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can add a future public meeting event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Meeting';
      const eventTitle = `Admin public Meeting / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillMeetingForm({
        eventPrivacy: 'public',
        isSecret: false,
        eventTitle,
        dataToCheck: {
          calendarSlot: futureSlot,
        },
      });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can add a future private meeting event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Meeting';
      const eventTitle = `Admin private Meeting / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillMeetingForm({
        eventPrivacy: 'private',
        isSecret: false,
        eventTitle,
        dataToCheck: {
          calendarSlot: futureSlot,
        },
      });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can add a future protected meeting event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Meeting';
      const eventTitle = `Admin protected Meeting / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillMeetingForm({
        eventPrivacy: 'protected',
        isSecret: false,
        eventTitle,
        dataToCheck: {
          calendarSlot: futureSlot,
        },
      });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can add a future public slate event', function () {
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

  it('An admin can add a future private slate event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Slate';
      const eventTitle = `Admin private slate / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes}`;
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const shuffledTitles = [...movieTitles].sort(() => 0.5 - Math.random());
      const randomSelection = Math.floor(Math.random() * (movieTitles.length - 1)) + 1;
      const selectedTitles = shuffledTitles.slice(0, randomSelection);
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillSlateForm({
        eventPrivacy: 'private',
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

  it('An admin can add a future protected slate event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Slate';
      const eventTitle = `Admin protected slate / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes}`;
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const shuffledTitles = [...movieTitles].sort(() => 0.5 - Math.random());
      const randomSelection = Math.floor(Math.random() * (movieTitles.length - 1)) + 1;
      const selectedTitles = shuffledTitles.slice(0, randomSelection);
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillSlateForm({
        eventPrivacy: 'protected',
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

  it('An admin can add a future public and secret slate event', function () {
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

describe('Create an event as member', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    firebase.getScreeningData({ userType: 'member' })
      .then((data: { org: Organization; user: User; movies: Movie[] }) => {
        firebase.deleteAllSellerEvents(data.user.uid);
        cypress.wrapFeedbackData(data);
        cy.visit('');
        cy.contains('Accept cookies').click();
        auth.loginWithEmailAndPassword(data.user.email);
        cy.visit('');
      });
    get('my-events').click();
  });

  it('A member can add a future public screening event', function () {
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const eventType = 'Screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Member public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movieTitle}`;
      cypress.selectSlot(futureSlot);
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        eventPrivacy: 'public',
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
          cypress.searchInEvents({ title: eventTitle, type: 'public screening', expected: true });
        });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });
});

//* CYPRESS FUNCTIONS *//

const cypress = {
  getScreeningDataAndLogin(options: { userType: UserRole; moviesWithScreener?: boolean }) {
    const { userType, moviesWithScreener } = options;
    cy.task('getRandomScreeningData', {
      app: 'festival',
      access: { marketplace: true, dashboard: true },
      userType: userType,
      moviesWithScreener: moviesWithScreener,
    }).then((data: { org: Organization; user: User; movies: Movie[] }) => {
      cy.task('deleteAllSellerEvents', data.user.uid);
      cy.wrap(data.org).as('org');
      cy.wrap(data.user).as('user');
      cy.wrap(data.movies).as('movies');
      cy.visit('');
      cy.contains('Accept cookies').click();
      auth.loginWithEmailAndPassword(data.user.email);
      cy.visit('');
    });
    get('my-events').click();
  },

  //angular calendar being a module, we can only use its created classes and styles to target its elements
  selectSlot(time: EventSlot) {
    const { day, hours, minutes } = time;
    cy.get('.cal-day-column')
      .eq(day)
      .find('.cal-hour')
      .eq(hours)
      .children()
      .eq(!minutes ? 0 : 1)
      .click();
  },

  getEventSlot(time: EventSlot) {
    const { day, hours, minutes } = time;
    //30 minutes are 30px high, an hour 60px
    let topOffset = hours * 60;
    if (minutes === 30) topOffset += 30;
    return cy.get('.cal-day-column').eq(day).find('.cal-events-container').find(`[style^="top: ${topOffset}px"]`);
  },

  searchInEvents(data: { title: string; type?: string; expected: boolean }) {
    const { title, type, expected } = data;
    let eventFound = false;
    return getAllStartingWith('event_')
      .then(events => {
        events.toArray().map(event => {
          if (event.textContent.includes(title)) {
            expect(event.textContent).to.include(type);
            eventFound = true;
          }
        });
      })
      .then(() => (expected ? expect(eventFound).to.be.true : expect(eventFound).to.be.false));
  },

  fillPopinForm(data: { eventType: 'Screening' | 'Meeting' | 'Slate'; eventTitle: string }) {
    const { eventType, eventTitle } = data;
    get('event-type').click();
    getInList('type_', eventType);
    get('event-title-modal').clear().type(eventTitle);
    get('more-details').click();
  },

  fillScreeningForm(data: {
    eventPrivacy: 'public' | 'protected' | 'private';
    isSecret: boolean;
    eventTitle: string;
    movieTitle: string;
    dataToCheck: { movieTitles: string[]; calendarSlot: EventSlot };
  }) {
    const { eventPrivacy, isSecret, eventTitle, movieTitle, dataToCheck } = data;
    get('warning-chip').should('exist');
    get('title').click();
    getAllStartingWith('title_').then(options => {
      // check if all titles are availables
      options.toArray().forEach(option => expect(dataToCheck.movieTitles).to.include(option.children[0].textContent.trim()));
    });
    cy.get('body').type('{esc}');
    cypress.selectTitle(movieTitle);
    get('title').should('contain', movieTitle);
    get('description').type(`Description : ${eventTitle}`);
    get(eventPrivacy).click();
    if (isSecret) get('secret').click();
    get('event-save').should('be.enabled');
    get('event-save').click();
    get('event-save-disabled').should('be.disabled');
    get('arrow-back').click();
    cypress.getEventSlot(dataToCheck.calendarSlot).should('contain', movieTitle);
  },

  fillMeetingForm(data: {
    eventPrivacy: 'public' | 'protected' | 'private';
    isSecret: boolean;
    eventTitle: string;
    dataToCheck: { calendarSlot: EventSlot };
  }) {
    const { eventPrivacy, eventTitle, dataToCheck } = data;
    get('description').type(`Description : ${eventTitle}`);
    get(eventPrivacy).click();
    get('event-save').should('be.enabled');
    get('event-save').click();
    get('event-save-disabled').should('be.disabled');
    get('arrow-back').click();
    cypress.getEventSlot(dataToCheck.calendarSlot).should('contain', eventTitle);
  },

  fillSlateForm(data: {
    eventPrivacy: 'public' | 'protected' | 'private';
    isSecret: boolean;
    eventTitle: string;
    selectedTitles: string[];
    dataToCheck: { calendarSlot: EventSlot };
  }) {
    const { eventPrivacy, isSecret, eventTitle, selectedTitles, dataToCheck } = data;
    get('description').type(`Description : ${eventTitle}`);
    get(eventPrivacy).click();
    if (isSecret) get('secret').click();
    get('titles').click();
    for(const title of selectedTitles) {
      getInList('titles_', title);
    }
    cy.get('body').type('{esc}');
    get('event-save').click();
    get('arrow-back').click();
    cypress.getEventSlot(dataToCheck.calendarSlot).should('contain', eventTitle);
  },

  wrapFeedbackData(data: { org: Organization; user: User; movies: Movie[] }) {
    cy.wrap(data.org).as('org');
    cy.wrap(data.user).as('user');
    cy.wrap(data.movies).as('movies');
  },

  selectTitle(movieTitle: string) {
    get('title').click();
    getInList('title_', movieTitle);
  },

  connectUser(email: string) {
    get('login').click();
    assertUrlIncludes('auth/connexion');
    get('email').type(email);
    get('password').type(USER_FIXTURES_PASSWORD);
    get('submit').click();
  },
};

//* Firebase functions

const firebase = {
  getScreeningData(options: { userType: UserRole; moviesWithScreener?: boolean }) {
    const { userType, moviesWithScreener } = options;
    return cy.task('getRandomScreeningData', {
      app: 'festival',
      access: { marketplace: true, dashboard: true },
      userType: userType,
      moviesWithScreener: moviesWithScreener,
    });
  },

  deleteAllSellerEvents(userId: string) {
    return cy.task('deleteAllSellerEvents', userId);
  },

  getRandomUser(data: { app: App; access: ModuleAccess; userType: UserRole }) {
    const { app, access, userType } = data;
    return cy.task('getRandomMember', { app, access, userType });
  },
};

//* JS FUNCTIONS *//

function getCurrentWeekDays() {
  const d = new Date();
  const weekDays = [];
  d.setDate(d.getDate() - d.getDay());
  for (let i = 0; i < 7; i++) {
    weekDays.push({
      day: d.toLocaleString('en-us', { weekday: 'long' }),
      date: `${new Date(d).toLocaleString('en-us', { month: 'short' })} ${new Date(d).getDate()}`,
    });
    d.setDate(d.getDate() + 1);
  }
  return weekDays;
}

interface EventSlot {
  day: number;
  hours: number;
  minutes: 0 | 30;
}

function createPastSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = Math.floor(Math.random() * new Date().getDay());
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isPast(add(startOfWeek(new Date()), { days: slot.day, hours: slot.hours, minutes: slot.minutes })));
  return slot;
}

function createFutureSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = new Date().getDay() + Math.floor(Math.random() * (7 - new Date().getDay()));
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isFuture(add(startOfWeek(new Date()), { days: slot.day, hours: slot.hours, minutes: slot.minutes })));
  return slot;
}
