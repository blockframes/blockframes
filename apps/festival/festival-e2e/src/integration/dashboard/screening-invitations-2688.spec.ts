/// <reference types="cypress" />

// Utils
import {
  NOW,
  USER_1,
  USER_3,
  USER_4,
  PRIVATE_EVENTNAME,
  PARTICIPANT_1_NAME,
  PARTICIPANT_2_NAME,
  ORG_NAME,
  USER_2
} from '../../fixtures/data'
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { MOVIES } from '@blockframes/e2e/utils/movies';

// Pages
import { FestivalMarketplaceHomePage, FestivalMarketplaceEventPage, FestivalMarketplaceScreeningPage, FestivalOrganizationListPage, FestivalMarketplaceOrganizationTitlePage, FestivalScreeningPage } from '../../support/pages/marketplace/index';
import { FestivalDashboardHomePage, EventPage, EventEditPage, FestivalInvitationsPage } from '../../support/pages/dashboard/index';

const MOVIE_TITLE = MOVIES[3].title.international;
let SCREENING_URL: string;

describe('User invites other users to his private screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest();
  });

  it(`User creates a screening and invites ${PARTICIPANT_1_NAME} and ${PARTICIPANT_2_NAME} to the screening`, () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar()
    const p3: EventEditPage = p2.createDetailedEventToday(NOW);
    p3.addEventTitle(PRIVATE_EVENTNAME);
    p3.checkAllDay();
    p3.selectMovie(MOVIE_TITLE);
    p3.inviteUser([USER_2.email, USER_3.email]);
    // We need to wait to fetch the invited user
    p3.copyGuests();
    cy.wait(30000);
    p3.saveEvent();
    const p4 = p3.goToDashboard();
    p4.logout();
  });

  it(`${PARTICIPANT_1_NAME} logs in and accepts his invitations and run the video`, () => {
    signIn(USER_2);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalInvitationsPage = p1.goToInvitations();
    cy.wait(2000)
    p2.acceptInvitationScreening();
    // Wait for post request to finish
    // TODO: verify UI has changed instead of wait
    cy.wait(5000);
    // TODO: remove the reload after that issue#3379 is fixed
    cy.reload();

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

  it(`${PARTICIPANT_2_NAME} logs in and refuse her invitations and logs out`, () => {
    signIn(USER_3);
    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToInvitations();
    cy.wait(2000);
    p2.refuseInvitationScreening();
    // Wait for post request to finish
    // TODO: verify UI has changed instead of wait
    cy.wait(5000);
  });

  it('Event create logs in and verifies the accepted invitations', () => {
    cy.visit('/auth/welcome');
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2 = p1.goToNotifications()
    p2.verifyNotification(PARTICIPANT_1_NAME, true);
    p2.verifyNotification(PARTICIPANT_2_NAME, false);
  });

  it('Pamela logs in, go on event page, asserts she can\'t access to the video and force the url', () => {
    signIn(USER_4);
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
