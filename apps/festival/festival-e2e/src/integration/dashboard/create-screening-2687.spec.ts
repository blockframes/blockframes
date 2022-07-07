﻿/// <reference types="cypress" />

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
import { EVENTS } from '@blockframes/e2e/utils';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { Orgs } from '@blockframes/e2e/fixtures/orgs';
import { SEC } from '@blockframes/e2e/utils';

let tomorrow, twodayslater;
export const NOW = new Date();
const userFixture = new User();
const orgsFixture = new Orgs();
const users  =  [
  (userFixture.getByUID(EVENTS[0].by.uid)),
  (userFixture.getByUID(USER.Vincent))
];

//TODO: Issue: #6953 - Fix this issue separately
describe.skip('User create a screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
    tomorrow = new Date(new Date().setDate(NOW.getDate() + 1));
    twodayslater = new Date(new Date().setDate(NOW.getDate() + 2));
    const p1 = new LandingPage();
    p1.clickLogin();
  });

  it('Organiser logs in, creates 4 screening events', () => {
    signIn(users[0], true);
    acceptCookie();

    cy.log('From Marketplace Homepage, navigating to calendar...');
    (new FestivalMarketplaceHomePage()).goToDashboard();
    const homePage = new FestivalDashboardHomePage();
    const eventPage: EventPage = homePage.goToCalendar();
    const eventInfo = [
        [0, tomorrow, false],
        [1, tomorrow, true],
        [0, twodayslater, true],
        [1, twodayslater, false]
    ];
    eventInfo.forEach((x: any, index:number) => {
        const [i, d, p] = x;
        const eventName = EVENTS[i].event + index;
        eventPage.createEvent(eventName, d, EVENTS[i].movie.title.international, p);
    });
  })

  it('Invitee1, Verify screening page and created screenings', () => {
    const orgName = orgsFixture.getByID(EVENTS[0].org.id).name;
    const event1 = EVENTS[0].event;
    const event2 = EVENTS[1].event;

    signIn(users[1]);
    acceptCookie();

    const eventNames: string[] = [event1+'0', event2+'1',
            event1+'2', event2+'3',];

    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    cy.log(`Navigating to [${orgName}] screening schedule`);
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    p2.searchPartner(orgName);
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(orgName);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    cy.log('=>Test Screenings are listed');
    p4.assertScreeningsExists(eventNames);

    cy.log('=>Test Request invite for private screening');
    p4.clickRequestInvitation(eventNames[0], false);

    cy.log('=>Test Screening details exist');
    p4.checkEventsInMarket(eventNames);
  });

  it('Organiser accepts private screening request', () => {
    signIn(users[0]);
    acceptCookie();
    const p1 = (new FestivalMarketplaceHomePage()).goToDashboard();
    const p2: FestivalInvitationsPage = p1.clickOnInvitations();
    p2.acceptInvitationScreening();
  });

  it('Invitee adds public screening to his calendar', () => {
    const orgName = orgsFixture.getByID(EVENTS[0].org.id).name;
    //Screening event prefixed 2 created above.
    const screeningEvent = EVENTS[0].event + '2';
    const movieTitle = EVENTS[0].movie.title.international;

    signIn(users[1]);
    acceptCookie();

    const p1 = new FestivalMarketplaceHomePage();

    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    cy.wait(10 * SEC);

    //Search for Partner Org and go the screenings
    cy.log(`Seek out partner: ${orgName}`);
    p2.searchPartner(orgName);
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(orgName);

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
    cy.log(`=>Test Notification from {${orgName}} exists`);
    pn.verifyNotification(orgName, true);
  });
});
