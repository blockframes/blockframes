/// <reference types="cypress" />

// Pages
import {
  FestivalMarketplaceHomePage,
  FestivalOrganizationListPage,
  FestivalMarketplaceOrganizationTitlePage,
  FestivalScreeningPage,
  FestivalMarketplaceNotificationsPage,
  FestivalMarketplaceCalendarPage,
  FestivalMarketplaceEventPage
} from '../../support/pages/marketplace/index';
import {
  FestivalDashboardHomePage,
  FestivalInvitationsPage,
  EventPage
} from '../../support/pages/dashboard/index';
import { LandingPage } from '../../support/pages/landing';
// Hooks
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { NOW } from '../../fixtures/data';
import { EVENTS } from '@blockframes/e2e/utils/screenings';
import { User } from '../../fixtures';

let tomorrow, twodayslater;
const userFixture = new User();
const users  =  [ 
  (userFixture.get({exist: true, key:'email', value: EVENTS[0].by.email})[0]),
  (userFixture.get({exist: true, key:'email', value: 'vchoukroun@fake.com'})[0])
];

describe('User create a screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
    tomorrow = new Date(new Date().setDate(NOW.getDate() + 1));
    twodayslater = new Date(new Date().setDate(NOW.getDate() + 2));
    const p1 = new LandingPage();
    p1.clickSignup();      
  });

  it('User Jean Felix logs in, creates 4 screening events', () => {
  
    signIn(users[0], true);

    (new FestivalMarketplaceHomePage()).goToDashboard();
    const marketPage = new FestivalDashboardHomePage();
    const eventPage: EventPage = marketPage.goToCalendar();

    cy.log('Navigating to calendar');
    cy.get('a[test-id="calendar"]').then($menu => {
      if ($menu.length) {
        cy.wrap($menu).click();
      } else {
        cy.get('button[test-id=menu]').click();
        cy.get('a[test-id="calendar"]').click();
      }
      cy.wait(1000);
      cy.get('button[test-id="menu"]', {timeout: 1200}).first().click();

      //[Event Index, Date of Event, Is Public]
      [[0, tomorrow, false], [1, tomorrow, true], 
      [0, twodayslater, true], [1, twodayslater, false]].forEach((x: any, index:number) => {
          const [i, d, p] = x;
          const eventName = EVENTS[i].event + index;
          eventPage.createEvent(eventName, d, 
                  EVENTS[i].movie.title.international, p);
      });
    });
  })  

  it('Login Vincent, Verify screening page and created screenings', () => {
    const OrgName = EVENTS[0].org.name;
    const event1 = EVENTS[0].event;
    const event2 = EVENTS[1].event;

    signIn(users[1]);

    const eventNames: string[] = [event1+'0', event2+'1',
            event1+'2', event2+'3',];

    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    cy.log(`Navigating to [${OrgName}] screening schedule`);
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(OrgName);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    cy.log('=>Test Screenings are listed');
    p4.assertScreeningsExists(eventNames);

    cy.log('=>Test Request invite for private screening');
    p4.clickRequestInvitation(eventNames[0]);

    cy.log('=>Test Screening details exist');
    p4.checkEventsInMarket(eventNames);
  });

  it('Jean accepts private screening request', () => {
    signIn(users[0]);
    (new FestivalMarketplaceHomePage()).goToDashboard();
    const p1 = new FestivalDashboardHomePage();
    const p2: FestivalInvitationsPage = p1.clickOnInvitations();
    p2.acceptInvitationScreening();
  });

  it('Vincent adds public screening to his calendar', () => {
    const OrgName = EVENTS[0].org.name;
    const screeningEvent = EVENTS[0].event;
    const movieTitle = EVENTS[0].movie.title.international;

    signIn(users[1]);

    const p1 = new FestivalMarketplaceHomePage();
    const pn: FestivalMarketplaceNotificationsPage = p1.goToNotifications();
    // Wait notifications
    cy.wait(8000);
    cy.log(`=>Test Notification from {${OrgName}} exists`);
    pn.verifyNotification(OrgName, true); 

    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(OrgName);
    cy.log(`[A]: schedule screening of {${screeningEvent}}`);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    p4.clickRequestInvitation(screeningEvent);
    p4.clickOnMenu();
    const p5: FestivalMarketplaceCalendarPage = p4.selectCalendar();
    const p6: FestivalMarketplaceEventPage = p5.clickOnEvent(movieTitle);
    //cy.wait(5000);
    cy.log(`{${movieTitle}} must exist in user schedule! | [A]`);
    p6.assertScreeningExist(movieTitle);
  });
});
