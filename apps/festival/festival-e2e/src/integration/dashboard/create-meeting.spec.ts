import {
  auth,
  get,
  getByClass,
  cypress,
  firebase,
  EventSlot,
  createFutureSlot,
  getCurrentWeekDays,
} from '@blockframes/testing/cypress/browser';
import { Organization, User, Movie } from '@blockframes/model';

describe('Meeting creation', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    firebase.getScreeningData({ userType: 'admin' }).then((data: { org: Organization; user: User; movies: Movie[] }) => {
      firebase.deleteAllSellerEvents(data.user.uid);
      cypress.wrapFeedbackData(data);
      cy.visit('');
      cypress.acceptIfCookies();
      auth.loginWithEmailAndPassword(data.user.email);
      cy.visit('');
    });
    get('my-events').click();
  });

  it('calendar shows current week', () => {
    const currentWeekDays = getCurrentWeekDays();
    getByClass('cal-header').each((header, index) => {
      expect(header).to.contain(currentWeekDays[index].day);
      expect(header).to.contain(currentWeekDays[index].date);
    });
  });

  it('can add a future public meeting event', function () {
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

  it('can add a future all day public meeting event', function () {
    cy.then(function () {
      const randomDay = Math.floor(Math.random() * 7);
      const randomSlot: EventSlot = { day: randomDay, hours: 12, minutes: 0 };
      const eventType = 'Meeting';
      const eventTitle = `Admin all day public meeting`;
      cypress.goToNextWeek();
      cypress.selectSlot(randomSlot);
      get('all-day').click();
      cypress.fillPopinForm({ eventType, eventTitle });
      cypress.fillMeetingForm({
        eventPrivacy: 'public',
        isSecret: false,
        eventTitle,
        dataToCheck: {
          calendarSlot: randomSlot.day,
        },
      });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('can visualize multiple future meetings events taking place at the same time', function () {
    cy.then(function () {
      const randomDay = Math.floor(Math.random() * 7);
      const eventType = 'Meeting';
      const eventTitle = `Multiple`;
      cypress.goToNextWeek();
      cypress.createMultipeEvents({ day: randomDay, eventType: eventType, eventTitle, multiple: 3 });
      // check if the events divide the column width adequately
      cy.get('.cal-event-container').then(eventSlots => {
        eventSlots.each(index => {
          const style = eventSlots[index].getAttribute('style');
          if (!index) expect(style).to.include('left: 0%; width: 33.3333%');
          if (index === 1) expect(style).to.include('left: 33.3333%; width: 33.3333%');
          if (index === 2) expect(style).to.include('left: 66.6667%; width: 33.3333%');
        });
      });
      firebase.deleteAllSellerEvents(this.user.uid);
    });
  });

  it('can delete an upcoming event', function () {
    const futureSlot = createFutureSlot();
    const eventType = 'Meeting';
    const eventTitle = `Event to delete`;
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
    get('meeting-title').click();
    get('event-delete').click();
    get('confirm').click();
    get('meeting-title').should('not.exist');
    firebase.deleteAllSellerEvents(this.user.uid);
  });

  it('can edit an upcoming event', function () {
    const futureSlot = createFutureSlot();
    const editHour = futureSlot.hours === 23 ? 22 : 23;
    const eventType = 'Meeting';
    const eventTitle = `Event to edit`;
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
    get('meeting-title').click();
    get('event-title-modal').clear();
    get('event-title-modal').type('Event modified');
    get('event-start').find('[type=time]').click();
    cy.contains(`${editHour}:00`).click();
    get('event-end').find('[type=time]').click();
    cy.contains(`${editHour}:30`).click();
    get('event-save').click();
    get('arrow-back').click();
    cypress.getEventSlot({ day: futureSlot.day, hours: editHour, minutes: 0 }).should('contain', 'Event modified');
    firebase.deleteAllSellerEvents(this.user.uid);
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
