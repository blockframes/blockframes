/// <reference types="cypress" />

// Utils
import { acceptCookie, clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { EVENTS } from '@blockframes/e2e/utils';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { Orgs } from '@blockframes/e2e/fixtures/orgs';

// Pages
import { FestivalMarketplaceHomePage, FestivalMarketplaceEventPage, FestivalMarketplaceScreeningPage, FestivalOrganizationListPage, FestivalMarketplaceOrganizationTitlePage, FestivalScreeningPage } from '../../support/pages/marketplace/index';
import { FestivalDashboardHomePage, EventPage, FestivalInvitationsPage } from '../../support/pages/dashboard/index';
import { LandingPage } from '../../support/pages/landing';
import { auth, awaitElementDeletion, events, festival } from '@blockframes/testing/e2e';

export const NOW = new Date();
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

//TODO: Issue: 6757 - Fix this issue separately
describe('Organiser invites other users to private screening', () => {
  beforeEach(() => {
    cy.visit('/');
    auth.clearBrowserAuth()
    cy.visit('/');
  })

  it('Organiser creates screening & invites 2 users to the screening', () => {
    // cy.task('deleteAllSellerEvents', users[UserIndex.Organiser].uid) // ! Clean up any existing events!
    /*
    * We need to create a seller, create an org, upload a title, create a screening event for it
    * we need to make two buyer users
    * we need to invite those buyers to the screening
    * then we run the test.
    */
   cy.clearLocalStorage(); // ! If event is deleted manually, it will be stuck in localStorage cache
   cy.contains('Accept cookies').click();
   cy.task('log', users[UserIndex.Organiser].uid);
    auth.loginWithEmailAndPassword(users[UserIndex.Organiser].email);


    // (new FestivalMarketplaceHomePage()).goToDashboard();
    // const p1 = new FestivalDashboardHomePage();
    // const p2: EventPage = p1.goToCalendar();
    cy.intercept('/c/o/dashboard/event').as('calendar');
    cy.visit('/c/o/dashboard/event')
    cy.wait('@calendar');


    cy.log(`Create screening {${TestEVENT.event}}`)
    awaitElementDeletion('mat-spinner');
    events.deleteAllSellerEvents(users[UserIndex.Organiser].uid); // ! must stay here so eventsService is instantiated
    festival.createDetailedEvent(new Date(), 'Screening', TestEVENT.event);


    // const invitees = [users[UserIndex.InvitedUser1].email, users[UserIndex.InvitedUser2].email];
    // p2.createEvent(TestEVENT.event, NOW, TestEVENT.movie.title.international, false, invitees);

    cy.pause();
  });

  it(`InvitedUser1: logs in, accepts his invitations & runs the video`, () => { // ! This is a smell - tests should not rely on order
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

    cy.log("Reach Market Home.")
    const p1 = new FestivalMarketplaceHomePage();

    cy.log("Navigate to Screening Page from Screening Schedule");
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(OrgName);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();

    cy.log("Navigate to Marketplace Event Page");
    const p5: FestivalMarketplaceEventPage = p4.clickPrivateEvent();
    p5.assertJoinScreeningNotExists();

    // Navigate with url
    cy.log(`Should not access {${SCREENING_URL}}`);
    cy.visit(SCREENING_URL);
    // Assert the user is redirect to event page
    new FestivalMarketplaceEventPage();
  });
});
