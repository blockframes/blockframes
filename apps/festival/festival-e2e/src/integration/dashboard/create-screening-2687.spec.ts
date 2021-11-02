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
import { acceptCookie, clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { NOW } from '../../fixtures/data';
import { EVENTS } from '@blockframes/e2e/utils';
import { User as UserType } from '@blockframes/e2e/utils/type';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { Orgs } from '@blockframes/e2e/fixtures/orgs';
import { SEC } from '@blockframes/e2e/utils';


const userFixture = new User();
const orgsFixture = new Orgs();
const users  =  [
  (userFixture.getByUID(EVENTS[2].by.uid)),
  (userFixture.getByUID(USER.Vincent))
];

const tomorrow = new Date(new Date().setDate(NOW.getDate() + 1));
const twodayslater = new Date(new Date().setDate(NOW.getDate() + 2));
const eventInfo = [
  [2, tomorrow, false],
  [3, tomorrow, true],
  [2, twodayslater, true],
  [3, twodayslater, false]
];

const logInAndNavigate = ((user: Partial<UserType>, 
    location: string = '/c/o/marketplace/home') => {
  cy.login(user.email, user.password);
  acceptCookie();
  // Navigate to the location
  cy.visit(location);
});

describe.skip('Screening Event Creation Test', () => {
  let homePage: FestivalDashboardHomePage;

  describe.only('Screening Event Creation Test', () => {
    it('Logs in Event Creator', () => {
      clearDataAndPrepareTest('/');
      logInAndNavigate(users[0]);
      (new FestivalMarketplaceHomePage()).goToDashboard();
      homePage = new FestivalDashboardHomePage();
      homePage.goToCalendar();
    });

    eventInfo.forEach((x: any, index:number) => {
      const [i, date, ispublic] = x;
      const eventName = EVENTS[i].event + index;
      const eventPage = new EventPage();

      it('Create screening event', () => {
        cy.log('Open Calendar and mark the event');
        //in constructor ...
        //cy.get('festival-dashboard', { timeout: 60 * SEC });
        eventPage.checkCalendarView();
        eventPage.createEvent(date, eventName);
      });
  
      it('Complete Detailed Event', () => {
        cy.log('Should fill Event Details');
        cy.get('event-details-edit', { timeout: 90 * SEC });
        eventPage.createEventDetails2(EVENTS[i].movie.title.international, ispublic, []);
      });
    });
  });

});


describe.only('Screening Events Verification Test', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
  });

  it.only('Invitee1, Verify screening page and created screenings', () => {
    const OrgName = orgsFixture.getByID(EVENTS[2].org.id).denomination.public;
    const event1 = EVENTS[2].event;
    const event2 = EVENTS[3].event;

    logInAndNavigate(users[1]);

    const eventNames: string[] = [event1+'0', event2+'1',
            event1+'2', event2+'3',];

    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    cy.log(`Navigating to [${OrgName}] screening schedule`);
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    p2.searchPartner(OrgName);
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(OrgName);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    cy.log('=>Test Screenings are listed');
    p4.assertScreeningsExists(eventNames);

    cy.log('=>Test Screening details exist');
    p4.checkEventsInMarket(eventNames);

    cy.log('=>Wait for button - handle the late appearance issue');
    p4.waitForAcceptButtons();
    
    cy.log('=>Test Request invite for private screening');
    p4.clickRequestInvitation(eventNames[0], false);
  });

  it('Organiser accepts private screening request', () => {
    logInAndNavigate(users[0]);
    const p1 = (new FestivalMarketplaceHomePage()).goToDashboard();
    const p2: FestivalInvitationsPage = p1.clickOnInvitations();
    p2.acceptInvitationScreening();
  });

  it('Invitee adds public screening to his calendar', () => {
    const event = EVENTS[2];
    const OrgName = orgsFixture.getByID(event.org.id).denomination.public;
    //Screening event prefixed 2 created above.
    const screeningEvent = event.event + '2';
    const movieTitle = event.movie.title.international;
    logInAndNavigate(users[1]);

    const p1 = new FestivalMarketplaceHomePage();

    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    cy.wait(10 * SEC);

    //Search for Partner Org and go the screenings
    cy.log(`Seek out partner: ${OrgName}`);
    p2.searchPartner(OrgName);
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(OrgName);

    //Check if public screening exists and request it.
    cy.log(`[A]: schedule screening of {${screeningEvent}}`);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    p4.clickRequestInvitation(screeningEvent, true);

    cy.log(`>Check in market place event page for {${movieTitle}}`);
    p4.clickOnMenu();
    const p5: FestivalMarketplaceCalendarPage = p4.selectCalendar();
    const p6: FestivalMarketplaceEventPage = p5.clickOnEvent(movieTitle, true);
    cy.log(`{${movieTitle}} must exist in user schedule! | [A]`);
    p6.assertScreeningExist(movieTitle);

    const pn: FestivalMarketplaceNotificationsPage = p1.goToNotifications();
    // Wait notifications
    cy.wait(3 * SEC);
    cy.log(`=>Test Notification from {${OrgName}} exists`);
    pn.verifyNotification(OrgName, true);
  });
});
