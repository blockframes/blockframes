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
        cypress.acceptIfCookies();
        auth.loginWithEmailAndPassword(data.user.email);
        cy.visit('');
      });
    get('my-events').click();
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

  it('An admin can add a future all day public screening event', function () {
    cy.then(function () {
      const randomDay =  Math.floor(Math.random() * 7)
      const randomSlot: EventSlot = { day: randomDay, hours: 12, minutes: 0 };
      const eventType = 'Screening';
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      const movieTitle = movieTitles[randomIndex];
      const eventTitle = `Admin all day public screening - ${movieTitle}`;
      cypress.goToNextWeek();
      cypress.selectSlot(randomSlot);
      get('all-day').click();
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillScreeningForm({
        eventPrivacy: 'public',
        isSecret: false,
        eventTitle,
        movieTitle,
        dataToCheck: {
          movieTitles,
          calendarSlot: randomSlot.day,
        },
      });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can visualize multiple future screening events taking place at the same time', function () {
    cy.then(function () {
      const randomDay =  Math.floor(Math.random() * 7)
      const eventType = 'Screening';
      const eventTitle = `Multiple`;
      cypress.goToNextWeek();
      cypress.createMultipeEvents({ day: randomDay, eventType: eventType, eventTitle, multiple: 3 });
      // check if the events divide the column width adequately
      cy.get('.cal-event-container')
        .then(eventSlots => {
          eventSlots.each(index => {
            const style = eventSlots[index].getAttribute('style');
            if(!index) expect(style).to.include('left: 0%; width: 33.3333%');
            if(index === 1) expect(style).to.include('left: 33.3333%; width: 33.3333%')
            if(index === 2) expect(style).to.include('left: 66.6667%; width: 33.3333%')
          })
        })
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('An admin can delete an upcoming event', function () {
    const futureSlot = createFutureSlot();
    const eventType = 'Screening';
    const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
    const randomIndex = Math.floor(Math.random() * movieTitles.length);
    const movieTitle = movieTitles[randomIndex];
    const eventTitle = `Event to delete`;
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
    get('movie-title').click();
    get('event-delete').click();
    get('confirm').click();
    get('movie-title').should('not.exist');
    firebase.deleteAllSellerEvents(this.user.uid);
  });

  it('An admin can edit an upcoming event', function () {
    const futureSlot = createFutureSlot();
    const editHour = futureSlot.hours === 23 ? 22 : 23;
    const eventType = 'Screening';
    const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
    const randomIndex = Math.floor(Math.random() * movieTitles.length);
    const movieTitle = movieTitles[randomIndex];
    const eventTitle = `Event to edit`;
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
    get('movie-title').click();
    get('event-title-modal').clear();
    get('event-title-modal').type('Event modified');
    get('event-start').find('[type=time]').click();
    cy.contains(`${editHour}:00`).click();
    get('event-end').find('[type=time]').click();
    cy.contains(`${editHour}:30`).click();
    get('event-save').click();
    get('arrow-back').click();
    cypress.getEventSlot({ day: futureSlot.day, hours: editHour, minutes: 0 }).should('contain', movieTitle);
    firebase.deleteAllSellerEvents(this.user.uid);
  });

  it('The ending time of a meeting cannot precede the starting time', function () {
    cy.then(function () {
      const randomDay =  Math.floor(Math.random() * 7)
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
          calendarSlot: futureSlot,
        },
      });
      get('movie-title').click();
      get('warning-chip').should('not.exist');
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });
});

//* CYPRESS FUNCTIONS *//

const cypress = {

  //* Form functions

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
    dataToCheck: { movieTitles?: string[]; calendarSlot: EventSlot | number};
  }) {
    const { eventPrivacy, isSecret, eventTitle, movieTitle, dataToCheck } = data;
    get('warning-chip').should('exist');
    if(dataToCheck.movieTitles) {
      get('title').click();
      getAllStartingWith('title_').then(options => {
        // check if all titles are availables
        options.toArray().forEach(option => expect(dataToCheck.movieTitles).to.include(option.children[0].textContent.trim()));
      });
      cy.get('body').type('{esc}');
    }
    cypress.selectTitle(movieTitle);
    get('title').should('contain', movieTitle);
    get('description').type(`Description : ${eventTitle}`);
    get(eventPrivacy).click();
    if (isSecret) get('secret').click();
    get('event-save').should('be.enabled');
    get('event-save').click();
    get('event-save-disabled').should('be.disabled');
    get('arrow-back').click();
    // check for non all-day events
    if(typeof(dataToCheck.calendarSlot) !== 'number') return cypress.getEventSlot(dataToCheck.calendarSlot).should('contain', movieTitle);
    // check for all-day events
    cy.get('.cal-all-day-events > .cal-day-columns > .cal-day-column')
      .then(columns => {
        const columnsLeftCoordinates: number[] = [];
        columns.each(index => {
          columnsLeftCoordinates.push(columns[index].getBoundingClientRect().x);
        });
        get('movie-title').then(eventCard => {
          const eventCardLeftCoordinate = eventCard[0].getBoundingClientRect().x;
          for (let i = 0; i < columnsLeftCoordinates.length - 1; i++) {
            const currentColumnLeft = columnsLeftCoordinates[i];
            const nextColumnLeft = columnsLeftCoordinates[i+1]
            if (eventCardLeftCoordinate > currentColumnLeft && eventCardLeftCoordinate < nextColumnLeft) {
              return expect(dataToCheck.calendarSlot).to.be.equal(i);
            }
          }
          // if meeting takes place on sunday
          return expect(dataToCheck.calendarSlot).to.be.equal(6);
        });
      })
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

  selectTitle(movieTitle: string) {
    get('title').click();
    getInList('title_', movieTitle);
  },

  //* Slots functions

  //angular calendar being a module, we can only use its created classes and styles to target its elements
  getEventSlot(time: EventSlot) {
    const { day, hours, minutes } = time;
    //30 minutes are 30px high, an hour 60px
    let topOffset = hours * 60;
    if (minutes === 30) topOffset += 30;
    return cy.get('.cal-day-column').eq(day).find('.cal-events-container').find(`[style^="top: ${topOffset}px"]`);
  },

  selectFirstSlotOfDay(day: number) {
    return cy.get('.cal-day-column')
      .eq(day)
      .find('.cal-hour')
      .eq(0)
      .children()
      .eq(0)
      .click();
  },
  
  selectSlot(time: EventSlot) {
    const { day, hours, minutes } = time;
    return cy.get('.cal-day-column')
      .eq(day)
      .find('.cal-hour')
      .eq(hours)
      .children()
      .eq(!minutes ? 0 : 1)
      .click();
  },

  getColumnsSpread() {
    console.log('column spread')
    return cy.get('.cal-all-day-events').find('.cal-day-column').eq(6).contains('')
  },

  //* Events functions

  createMultipeEvents(data: {
    day: number,
    eventType: 'Screening' | 'Meeting' | 'Slate',
    eventTitle: string,
    multiple: number
  }) {
    const { day, eventType, eventTitle, multiple } = data;
    for(let i = 0; i < multiple; i++) {
      cypress.selectFirstSlotOfDay(day);
      get('event-start').find('[type=time]').click();
      cy.contains('12:00').click();
      get('event-end').find('[type=time]').click();
      cy.contains('12:30').click();
      cypress.fillPopinForm({ eventType, eventTitle });
      get('arrow-back').click();
    }
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

  //* Miscellaneous functions

  acceptIfCookies() {
    cy.get('cookie-banner').then($el => $el.children().length && get('cookies').click());
  },

  connectUser(email: string) {
    get('login').click();
    assertUrlIncludes('auth/connexion');
    get('email').type(email);
    get('password').type(USER_FIXTURES_PASSWORD);
    get('submit').click();
  },

  goToNextWeek() {
    return get('arrow_forward').click();
  },

  wrapFeedbackData(data: { org: Organization; user: User; movies: Movie[] }) {
    cy.wrap(data.org).as('org');
    cy.wrap(data.user).as('user');
    cy.wrap(data.movies).as('movies');
  },

};

//* FIREBASE FUNCTIONS *//

const firebase = {

  deleteAllSellerEvents(userId: string) {
    return cy.task('deleteAllSellerEvents', userId);
  },

  getScreeningData(options: { userType: UserRole; moviesWithScreener?: boolean }) {
    const { userType, moviesWithScreener } = options;
    return cy.task('getRandomScreeningData', {
      app: 'festival',
      access: { marketplace: true, dashboard: true },
      userType: userType,
      moviesWithScreener: moviesWithScreener,
    });
  },

  getRandomUser(data: { app: App; access: ModuleAccess; userType: UserRole }) {
    const { app, access, userType } = data;
    return cy.task('getRandomMember', { app, access, userType });
  },

};

//* JS FUNCTIONS *//
interface EventSlot {
  day: number;
  hours: number;
  minutes: 0 | 30;
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

// not used yet, need to wait for issue #8203 to be resolved
function createPastSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = Math.floor(Math.random() * new Date().getDay());
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isPast(add(startOfWeek(new Date()), { days: slot.day, hours: slot.hours, minutes: slot.minutes })));
  return slot;
}

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
