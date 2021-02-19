﻿/// <reference types="cypress" />

// Utils
import { NOW } from '../../fixtures/data'
import { acceptCookie, clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { EVENTS } from '@blockframes/e2e/utils';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { Orgs } from '@blockframes/e2e/fixtures/orgs';

// Pages
import { FestivalMarketplaceHomePage, FestivalMarketplaceEventPage, FestivalMarketplaceScreeningPage, FestivalOrganizationListPage, FestivalMarketplaceOrganizationTitlePage, FestivalScreeningPage } from '../../support/pages/marketplace/index';
import { FestivalDashboardHomePage, EventPage, EventEditPage, FestivalInvitationsPage } from '../../support/pages/dashboard/index';
import { LandingPage } from '../../support/pages/landing';

const TestEVENT = EVENTS[0];
const invitedUsers = TestEVENT.invitees.map(u => u.uid);
const userFixture = new User();
const orgsFixture = new Orgs();
const OrgName = orgsFixture.getByID(TestEVENT.org.id).denomination.public;
const users  =  [ userFixture.getByUID(TestEVENT.by.uid) ];
users.push(...invitedUsers.map(uid => userFixture.getByUID(uid)));
users.push(userFixture.getByUID(USER.Ivo));
//Super Admin
users.push(userFixture.getByUID(USER.Daphney));
let SCREENING_URL: string;

enum UserIndex {
  Organiser = 0,
  InvitedUser1,
  InvitedUser2,
  UninvitedGuest,
  Admin
}

describe('Organiser invites other users to private screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
    const p1 = new LandingPage();
    p1.clickSignup();
  });

  it('Organiser creates screening & invites 2 users to the screening', () => {
    signIn(users[UserIndex.Organiser]);
    acceptCookie();

    (new FestivalMarketplaceHomePage()).goToDashboard();
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    cy.log(`Create screening {${TestEVENT.event}}`)
    const p3: EventEditPage = p2.createDetailedEvent(NOW, 'Screening', TestEVENT.event);
    p3.addEventTitle(TestEVENT.event);
    p3.checkAllDay();
    p3.selectMovie(TestEVENT.movie.title.international);

    const invitees = [users[UserIndex.InvitedUser1].email,
                      users[UserIndex.InvitedUser2].email];
    p3.inviteUser(invitees);
    // We need to wait to fetch the invited user
    p3.copyGuests();
    cy.wait(8000);
    p3.saveEvent();
  });

  it(`InvitedUser1: logs in, accepts his invitations & runs the video`, () => {
    signIn(users[UserIndex.InvitedUser1]);
    acceptCookie();

    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalInvitationsPage = p1.goToInvitations();
    cy.wait(2000);
    p2.acceptInvitationScreening();

    // Assets video runs
    p2.openMoreMenu();
    const p3: FestivalMarketplaceScreeningPage = p2.clickGoToEvent();

    // Save the current url for the next test
    cy.url().then(url => SCREENING_URL = url);

    p3.clickPlay();
    p3.runVideo();
    // TODO: Assert video is running
  });

  it(`InvitedUser2 logs in and refuses screening invitations`, () => {
    signIn(users[UserIndex.InvitedUser2]);
    acceptCookie();

    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToInvitations();
    cy.wait(2000);
    p2.refuseInvitationScreening();
  });

  // Member organiser do not get notification
  // Admin / Super Admin gets notification about invitation acceptance.
  it('Org admin logs in and verifies the accepted invitations', () => {
    signIn(users[UserIndex.Admin]);
    acceptCookie();

    (new FestivalMarketplaceHomePage()).goToDashboard();
    const p1 = new FestivalDashboardHomePage();
    const p2 = p1.goToNotifications()
    p2.verifyNotification(users[UserIndex.InvitedUser1].firstName, true);
    p2.verifyNotification(users[UserIndex.InvitedUser2].firstName, false);
  });

  it('UninvitedGuest logs in, go on event page, asserts no access to the video', () => {
    signIn(users[UserIndex.UninvitedGuest]);
    acceptCookie();

    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(OrgName);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    const p5: FestivalMarketplaceEventPage = p4.clickPrivateEvent();
    p5.assertJoinScreeningNotExists();

    // Navigate with url
    cy.log(`Should not access {${SCREENING_URL}}`);
    cy.visit(SCREENING_URL);
    // Assert the user is redirect to event page
    const p6 = new FestivalMarketplaceEventPage();
  });
});
