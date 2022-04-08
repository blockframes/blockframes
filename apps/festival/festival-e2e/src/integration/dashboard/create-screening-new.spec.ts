// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { auth, get, getInList, getByClass, getAllStartingWith } from '@blockframes/testing/cypress/browser';
import { User, Organization, Movie } from '@blockframes/model';

describe('Signup', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
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
    getScreeningDataAndLogin({ userType: 'admin' });
    console.log(currentWeekDays);
    getByClass('cal-header').each((header, index) => {
      expect(header).to.contain(currentWeekDays[index].day);
      expect(header).to.contain(currentWeekDays[index].date);
    });
  });

  it('A random admin can add a future public screening event', function () {
    getScreeningDataAndLogin({ userType: 'admin' });
    // below line allow us to use 'this' instead of calling object with 'get('@alias')'
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      selectSlot(futureSlot);
      get('event-type').click();
      getInList('type_', 'Screening');
      get('event-title-modal')
        .clear()
        .type(`Admin test / day = ${futureSlot.day}, hours = ${futureSlot.hours}:${futureSlot.minutes}`);
      get('more-details').click();
      get('warning-chip').should('exist');
      get('public').click();
      get('title').click();
      getAllStartingWith('title_').then(options => {
        // check if all titles are availables
        options.toArray().forEach(option => expect(movieTitles).to.include(option.children[0].textContent.trim()));
      });
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      getInList('title_', movieTitles[randomIndex]);
      get('title').should('contain', movieTitles[randomIndex]);
      get('description').type(
        `Description for admin test / day = ${futureSlot.day}, hours = ${futureSlot.hours}:${futureSlot.minutes}`
      );
      get('event-save').should('be.enabled');
      get('event-save').click();
      get('event-save-disabled').should('be.disabled');
      get('arrow-back').click();
      getEventSlot(futureSlot).should('contain', movieTitles[randomIndex]);
    });
  });

  it('A random member can add a future public screening event', () => {
    getScreeningDataAndLogin({ userType: 'member' });
    cy.then(function () {
      const futureSlot = createFutureSlot();
      const movieTitles = this.movies.map((movie: Movie) => movie.title.international.trim());
      selectSlot(futureSlot);
      get('event-type').click();
      getInList('type_', 'Screening');
      get('event-title-modal')
        .clear()
        .type(`Admin test / day = ${futureSlot.day}, hours = ${futureSlot.hours}:${futureSlot.minutes}`);
      get('more-details').click();
      get('public').click();
      get('title').click();
      const randomIndex = Math.floor(Math.random() * movieTitles.length);
      getInList('title_', movieTitles[randomIndex]);
      get('title').should('contain', movieTitles[randomIndex]);
      get('description').type(
        `Description for admin test / day = ${futureSlot.day}, hours = ${futureSlot.hours}:${futureSlot.minutes}`
      );
      get('event-save').click();
      get('arrow-back').click();
      getEventSlot(futureSlot).should('contain', movieTitles[randomIndex]);
    });
  });
});

//* CYPRESS FUNCTIONS *//

function getScreeningDataAndLogin(options: { userType: 'admin' | 'member'; moviesWithScreener?: boolean }) {
  const { userType, moviesWithScreener } = options;
  cy.task('getRandomScreeningData', {
    app: 'festival',
    access: { marketplace: true, dashboard: true },
    userType: userType,
    moviesWithScreener: moviesWithScreener,
  }).then((data: { org: Organization; user: User; movies: Movie[] }) => {
    //TODO : delete all events of this user
    cy.wrap(data.org).as('org');
    cy.wrap(data.user).as('user');
    cy.wrap(data.movies).as('movies');
    cy.visit('');
    cy.contains('Accept cookies').click();
    auth.loginWithEmailAndPassword(data.user.email);
    cy.visit('');
  });
  get('my-events').click();
}

//angular calendar being a module, we can only use its created classes and styles to target its elements
function selectSlot(time: EventSlot) {
  const { day, hours, minutes } = time;
  cy.get('.cal-day-column')
    .eq(day)
    .find('.cal-hour')
    .eq(hours)
    .children()
    .eq(!minutes ? 0 : 1)
    .click();
}

function getEventSlot(time: EventSlot) {
  const { day, hours, minutes } = time;
  //30 minutes are 30px high, an hour 60px
  let topOffset = hours * 60;
  if (minutes === 30) topOffset += 30;
  return cy.get('.cal-day-column').eq(day).find('.cal-events-container').find(`[style^="top: ${topOffset}px"]`);
}

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

function isSlotInThePast(slot: EventSlot) {
  const now = new Date();
  if (slot.day < now.getDay()) return true;
  if (slot.hours < now.getHours()) return true;
  if (slot.hours == now.getHours() && slot.minutes < now.getMinutes()) return true;
  return false;
}

function isSlotInTheFuture(slot: EventSlot) {
  const now = new Date();
  if (slot.day > now.getDay()) return true;
  if (slot.hours > now.getHours()) return true;
  if (slot.hours == now.getHours() && slot.minutes > now.getMinutes()) return true;
  return false;
}

function createPastSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = Math.floor(Math.random() * new Date().getDay());
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isSlotInThePast(slot));
  return slot;
}

function createFutureSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = new Date().getDay() + Math.floor(Math.random() * (7 - new Date().getDay()));
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isSlotInTheFuture(slot));
  return slot;
}
