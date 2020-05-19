/// <reference types="cypress" />

// Utils
import {
  LOGIN_CREDENTIALS,
  NOW,
  EVENTNAME,
  PARTICIPANT_1_EMAIL,
  PARTICIPANT_2_EMAIL,
  PARTICIPANT_1_NAME,
  PARTICIPANT_2_NAME,
  PASSWORD
} from '../../fixtures/data'
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';

// Pages
import { FestivalMarketplaceHomePage } from '../../support/pages/marketplace/index';
import { FestivalDashboardHomePage, EventPage, EventEditPage } from '../../support/pages/dashboard/index';




describe('User invites other users to his screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest();
  });

  it('User creates a screening and invites John Bryant and Sarah Gregory to the screening', () => {
    signIn(LOGIN_CREDENTIALS);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar()
    const p3: EventEditPage = p2.createDetailedEvent(NOW);
    p3.addEventTitle(EVENTNAME);
    p3.selectDate(NOW);
    p3.selectMovie();
    p3.inviteUser([PARTICIPANT_1_EMAIL, PARTICIPANT_2_EMAIL]);
    // We need to wait to fetch the invited user
    p3.copyGuests();
    cy.wait(5000);
    p3.saveEvent();
    const p4 = p3.goToDashboard();
    p4.logout();
  });

  it(`${PARTICIPANT_1_NAME} logs in and accepts his invitations and logs out`, () => {
    signIn({ email: PARTICIPANT_1_EMAIL, password: PASSWORD });
    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToInvitations();
    cy.wait(500)
    p2.acceptInvitationScreening();
    // Wait for post request to finish
    cy.wait(30000);
  });

  it(`${PARTICIPANT_2_NAME} in and accepts her invitations and logs out`, () => {
    signIn({ email: PARTICIPANT_2_EMAIL, password: PASSWORD });
    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToInvitations();
    cy.wait(500);
    p2.refuseInvitationScreening();
    // Wait for post request to finish
    cy.wait(30000);
  });

  it('Event create logs in and verifies the accepted invitations', () => {
    cy.visit('/auth/welcome');
    signIn(LOGIN_CREDENTIALS);
    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToNotifications()
    p2.verifyNotification(PARTICIPANT_1_NAME, true);
    p2.verifyNotification(PARTICIPANT_2_NAME, false);
  });
});
