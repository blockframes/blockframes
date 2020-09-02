/// <reference types="cypress" />

// Utils
import {
  NOW,
  USER_1,
  USER_3,
  USER_4,
  PRIVATE_EVENTNAME_1,
  PARTICIPANT_1_NAME,
  PARTICIPANT_2_NAME,
  ORG_NAME,
  USER_2
} from '../../fixtures/data'
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { EVENTS, MOVIES } from '@blockframes/e2e/utils';

// Pages
import { FestivalMarketplaceHomePage, FestivalMarketplaceEventPage, FestivalMarketplaceScreeningPage, FestivalOrganizationListPage, FestivalMarketplaceOrganizationTitlePage, FestivalScreeningPage } from '../../support/pages/marketplace/index';
import { FestivalDashboardHomePage, EventPage, EventEditPage, FestivalInvitationsPage } from '../../support/pages/dashboard/index';
import { LandingPage } from '../../support/pages/landing';
import { User } from '../../fixtures';

const MOVIE_TITLE = MOVIES[3].title.international;
const TestEVENT = EVENTS[0];
let SCREENING_URL: string;
const userFixture = new User();
const invitedUsers = TestEVENT.invitees.map(u => u.email);
const users  =  [ userFixture.getByEmail(TestEVENT.by.email) ];
//invitedUsers.forEach(userEmail => users.push(userFixture.getByEmail(userEmail)))
users.concat(invitedUsers.map(e => userFixture.getByEmail(e)));
users.push(userFixture.getByEmail('ivo.andrle@fake.com'));

enum UserIndex {
  Organiser = 0,
  InvitedUser1,
  InvitedUser2,
  UninvitedGuest
}

describe('Organiser invites other users to private screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
    const p1 = new LandingPage();
    p1.clickSignup();     
  });

  it.only(`User creates a screening and invites ${PARTICIPANT_1_NAME} and ${PARTICIPANT_2_NAME} to the screening`, () => {
    signIn(users[UserIndex.Organiser]);
    
    (new FestivalMarketplaceHomePage()).goToDashboard();
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    const p3: EventEditPage = p2.createDetailedEvent(NOW);
    p3.addEventTitle(TestEVENT.event);
    p3.checkAllDay();
    p3.selectMovie(TestEVENT.movie.title.international);
    p3.inviteUser(invitedUsers);
    // We need to wait to fetch the invited user
    p3.copyGuests();
    cy.wait(8000);
    p3.saveEvent();

    const p4 = p3.goToDashboard();
    p4.logout();
  });

  it.only(`InvitedUser1: Vincent logs in, accepts his invitations & runs the video`, () => {
    signIn(users[UserIndex.InvitedUser1]);

    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalInvitationsPage = p1.goToInvitations();
    cy.wait(2000);
    p2.acceptInvitationScreening();

    // Assets video runs
    p2.openMoreMenu();
    const p3: FestivalMarketplaceEventPage = p2.clickGoToEvent();
    const p4: FestivalMarketplaceScreeningPage = p3.clickJoinScreening();

    // Save the current url for the next test
    cy.url().then(url => SCREENING_URL = url);

    p4.clickPlay();
    p4.runVideo();
    // TODO: Assert video is running
  });

  it(`InvitedUser2 logs in and refuses screening invitations`, () => {
    signIn(users[UserIndex.InvitedUser2]);
    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToInvitations();
    cy.wait(2000);
    p2.refuseInvitationScreening();
  });

  it('Organiser logs in and verifies the accepted invitations', () => {
    signIn(users[UserIndex.Organiser]);
    const p1 = new FestivalDashboardHomePage();
    const p2 = p1.goToNotifications()
    p2.verifyNotification(PARTICIPANT_1_NAME, true);
    p2.verifyNotification(PARTICIPANT_2_NAME, false);
  });

  it('UninvitedGuest logs in, go on event page, asserts no access to the video', () => {
    signIn(users[UserIndex.UninvitedGuest]);
    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(ORG_NAME);
    const p4: FestivalScreeningPage = p3.clickOnScreeningSchedule();
    const p5: FestivalMarketplaceEventPage = p4.clickPrivateEvent();
    p5.assertJoinScreeningNotExists();

    // Navigate with url
    cy.visit(SCREENING_URL);
    // Assert the user is redirect to event page
    const p6 = new FestivalMarketplaceEventPage();
  });
});
