import { get, getInList, getAllStartingWith, assertUrlIncludes, EventSlot, AppAndUserType } from '@blockframes/testing/cypress/browser';
import { Organization, User, Movie, UserRole, EventTypes, eventTypes, AccessibilityTypes } from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';

//* CYPRESS FUNCTIONS *//

export const cypress = {

  //* Form functions

  fillMeetingForm(data: {
    accessibility: AccessibilityTypes;
    isSecret: boolean;
    eventTitle: string;
    dataToCheck: { calendarSlot: EventSlot | number };
  }) {
    const { accessibility, eventTitle, dataToCheck } = data;
    get('description').type(`Description : ${eventTitle}`);
    get(accessibility).click();
    get('event-save').should('be.enabled');
    get('event-save').click();
    get('event-save-disabled').should('be.disabled');
    get('arrow-back').click();
    // check for non all-day events
    if(typeof(dataToCheck.calendarSlot) !== 'number') return cypress.getEventSlot(dataToCheck.calendarSlot).should('contain', eventTitle);
    // check for all-day events
    cy.get('.cal-all-day-events > .cal-day-columns > .cal-day-column')
      .then(columns => {
        const columnsLeftCoordinates: number[] = [];
        columns.each(index => {
          columnsLeftCoordinates.push(columns[index].getBoundingClientRect().x);
        });
        get('meeting-title').then(eventCard => {
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

  fillPopinForm(data: { eventType: EventTypes; eventTitle: string }) {
    const { eventType, eventTitle } = data;
    get('event-type').click();
    getInList('type_', eventTypes[eventType]);
    get('event-title-modal').clear().type(eventTitle);
    get('more-details').click();
  },

  fillScreeningForm(data: {
    accessibility: AccessibilityTypes;
    isSecret: boolean;
    eventTitle: string;
    movieTitle: string;
    dataToCheck: { movieTitles?: string[]; calendarSlot: EventSlot };
  }) {
    const { accessibility, isSecret, eventTitle, movieTitle, dataToCheck } = data;
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
    get(accessibility).click();
    if (isSecret) get('secret').click();
    get('event-save').should('be.enabled');
    get('event-save').click();
    get('event-save-disabled').should('be.disabled');
    get('arrow-back').click();
    return cypress.getEventSlot(dataToCheck.calendarSlot).should('contain', movieTitle);
  },

  fillSlateForm(data: {
    accessibility: AccessibilityTypes;
    isSecret: boolean;
    eventTitle: string;
    selectedTitles: string[];
    dataToCheck: { calendarSlot: EventSlot };
  }) {
    const { accessibility, isSecret, eventTitle, selectedTitles, dataToCheck } = data;
    get('description').type(`Description : ${eventTitle}`);
    get(accessibility).click();
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

  //* Events functions

  createMultipeEvents(data: {
    day: number,
    eventType: EventTypes,
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

  searchInEvents(data: { title: string; accessibility?: string; expected: boolean }) {
    const { title, accessibility, expected } = data;
    let eventFound = false;
    return getAllStartingWith('event_')
      .then(events => {
        events.toArray().map(event => {
          if (event.textContent.includes(title)) {
            expect(event.textContent).to.include(accessibility);
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

export const firebase = {

  deleteAllSellerEvents(userId: string) {
    return cy.task('deleteAllSellerEvents', userId);
  },

  getScreeningData(options: { userType: UserRole; moviesWithScreener?: boolean }) {
    const { userType, moviesWithScreener } = options;
    return cy.task('getRandomScreeningData', {
      appAndUserType: {
        app: 'festival',
        access: { marketplace: true, dashboard: true },
        userType: userType,
      },
      options: {
        moviesWithScreener: moviesWithScreener,
      },
    });
  },

  getRandomUser(data: AppAndUserType) {
    const { app, access, userType } = data;
    return cy.task('getRandomMember', { app, access, userType });
  },

};