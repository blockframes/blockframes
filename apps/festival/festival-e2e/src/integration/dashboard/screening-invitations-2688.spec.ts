/// <reference types="cypress" />

// Utils
import ScreeningEvents from '../../fixtures/screening-events';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { Orgs } from '@blockframes/e2e/fixtures/orgs';

// Pages
import { acceptCookies, auth, awaitElementDeletion, events, festival } from '@blockframes/testing/e2e';

const ScreeningEvent = ScreeningEvents[0];
const invitedUserUIDs = ScreeningEvent.invitees.map((u) => u.uid);
const userObj = new User();
const orgObj = new Orgs();
const OrgName = orgObj.getByID(ScreeningEvent.org.id).denomination.public;
const users = [userObj.getByUID(ScreeningEvent.by.uid)];
users.push(...invitedUserUIDs.map((uid) => userObj.getByUID(uid)));
users.push(userObj.getByUID(USER.Ivo));
//Super Admin
users.push(userObj.getByUID(USER.Daphney));


enum UserIndex {
  Organiser = 0,
  InvitedUser1,
  InvitedUser2,
  UninvitedGuest,
  Admin,
}

let SCREENING_URL: string;

//TODO: Issue: 6757 - Fix this issue separately
describe('Organiser invites other users to private screening', () => {

  it('Organiser creates screening & invites 2 users to the screening', () => {
    /*
    //* This test isn't great, ideally we generate data and do the following
    * We need to create a seller, create an org
    * create a sceening/upload a title, create a screening event for it
    * we need to make two buyer users
    * we need to invite those buyers to the screening
    * then make sure invites were sent out, check notifs, check things.
    * NOTE - there should also be smaller tests that test sub components of this whole process.
    * TODO: Refactor page objects into page modules
    */

    cy.visit('/');
    auth.clearBrowserAuth();
    cy.visit('/');
    // cy.task('deleteAllSellerEvents', users[UserIndex.Organiser].uid) // ! Clean up any existing events! - DELETE THIS PLUGIN
    cy.clearLocalStorage(); // ! If event is deleted manually, it will be stuck in localStorage cache
    cy.contains('Accept cookies').click();
    cy.task('log', users[UserIndex.Organiser].uid);
    auth.loginWithEmailAndPassword(users[UserIndex.Organiser].email);
    cy.visit('/c/o/dashboard/event');
    cy.log(`Create screening {${ScreeningEvent.event}}`);
    awaitElementDeletion('mat-spinner');
    // * We would not need to do this if various user types were generated at the start of the test
    // * in order to generate user types, we either need to create a lot of data manually or use the app's built in methods
    events.deleteAllSellerEvents(users[UserIndex.Organiser].uid); // ! must stay here so eventsService is instantiated
    festival.createEvent(new Date(), 'Screening', ScreeningEvent.event);

    const invitees = [users[UserIndex.InvitedUser1].email, users[UserIndex.InvitedUser2].email]; // ! This is some terrible Mano coding. Redo fixtures.
    festival.fillEventDetails(ScreeningEvent.movie.title.international, !ScreeningEvent.private, invitees);
    // cy.contains('Save & Exit').click();
    // awaitElementDeletion('mat-spinner');

    // * STEP
    cy.log('InvitedUser1: logs in, accepts his invitations & runs the video');
    auth.clearBrowserAuth();
    cy.visit('/');

    auth.loginWithEmailAndPassword(users[UserIndex.InvitedUser1].email);


    cy.visit('/c/o/marketplace/home');
    cy.visit('/c/o/marketplace/invitations');
    awaitElementDeletion('mat-spinner');
    festival.acceptInvitationScreening()

    festival.openMoreMenu();
    festival.clickGoToEvent();

    // Save the current url for the next test
    cy.url().then((url) => (SCREENING_URL = url));

    awaitElementDeletion('mat-spinner');
    festival.clickPlay()
    festival.runVideo()
    awaitElementDeletion('mat-spinner');
    cy.get('.jw-video');
    cy.get('video.jw-video').should('have.prop', 'paused', true)
    .and('have.prop', 'ended', false)
    cy.get('.jw-display-icon-display > .jw-icon').click()
    awaitElementDeletion('[aria-label=Loading]')
    cy.get('video.jw-video').should('have.prop', 'paused', false)
    .then(($video) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore // * This only ignores the next line
      $video[0].pause()
    })
    cy.get('video.jw-video').should('have.prop', 'paused', true)
    cy.get('video').should(($video) => {
      expect($video[0].duration).to.be.gt(0);
    });


    // * STEP
    cy.log('InvitedUser2 logs in and refuses screening invitations');
    auth.clearBrowserAuth();
    cy.visit('/');
    auth.loginWithEmailAndPassword(users[UserIndex.InvitedUser2].email);
    acceptCookies();

    // const pp1 = new FestivalMarketplaceHomePage();
    // const pp2 = pp1.goToInvitations();
    cy.visit('/c/o/marketplace/invitations');
    // cy.wait(2000);
    awaitElementDeletion('mat-spinner');
    festival.refuseInvitationScreening();

    // * STEP
    // Member organiser do not get notification
    // Admin / Super Admin gets notification about invitation acceptance.
    cy.log('Org admin logs in and verifies the accepted invitations')
    auth.clearBrowserAuth();
    cy.visit('/');
    auth.loginWithEmailAndPassword(users[UserIndex.Admin].email);
    acceptCookies();

    cy.visit('/c/o/dashboard/event');
    cy.visit('/c/o/dashboard/invitations')

    festival.verifyNotification(users[UserIndex.InvitedUser1].firstName, true);
    festival.verifyNotification(users[UserIndex.InvitedUser2].firstName, false);

    // * STEP
    cy.log('UninvitedGuest logs in, go on event page, asserts no access to the video')
    auth.clearBrowserAuth();
    cy.visit('/');
    auth.loginWithEmailAndPassword(users[UserIndex.UninvitedGuest].email);
    acceptCookies();

    cy.log('Reach Market Home.');
    // const p1 = new FestivalMarketplaceHomePage();

    cy.log('Navigate to Screening Page from Screening Schedule');
    // p1.clickOnMenu();
    cy.visit('/c/o/marketplace/home');

    // const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    festival.selectSalesAgents();
    // const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(OrgName);
    festival.clickOnOrganization(OrgName);
    // const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    festival.clickOnScreeningSchedule();

    cy.log('Navigate to Marketplace Event Page');
    // const p5: FestivalMarketplaceEventPage = p4.clickPrivateEvent();
    festival.clickPrivateEvent();
    // p5.assertJoinScreeningNotExists();
    festival.assertJoinScreeningNotExists();

    // Navigate with url
    cy.log(`Should not access {${SCREENING_URL}}`);
    cy.visit(SCREENING_URL);
    // Assert the user is redirect to event page
    // new FestivalMarketplaceEventPage();
    cy.get('festival-event-view')
  });
});
