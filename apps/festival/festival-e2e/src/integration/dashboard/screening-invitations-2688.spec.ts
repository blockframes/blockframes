/// <reference types="cypress" />

// Utils
import { User } from '@blockframes/e2e/utils/type';
import { USERS } from '@blockframes/e2e/utils/users';
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';

// Pages
import { FestivalMarketplaceHomePage } from '../../support/pages/marketplace/index';
import { FestivalDashboardHomePage, EventPage, EventEditPage } from '../../support/pages/dashboard/index';

const LOGIN_CREDENTIALS: Partial<User> = USERS[0];
const NOW = new Date();
const EVENTNAME = 'test screening';
const PASSWORD = 'blockframes';
const PARTICIPANT_1_EMAIL = 'john.bryant@love-and-sons.fake.cascade8.com';
const PARTICIPANT_2_EMAIL = 'sarah.gregory@turner-gray.fake.cascade8.com';
const PARTICIPANT_1_NAME = 'Bryant John';
const PARTICIPANT_2_NAME = 'Gregory Sarah';

beforeEach(() => {
  clearDataAndPrepareTest();
});

describe('User invites other users to his screening', () => {
  it('User creates a screening and invites John Bryant and Sarah Gregory to the screening', () => {
    signIn(LOGIN_CREDENTIALS);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(NOW);
    p4.addEventTitle(EVENTNAME);
    p4.selectDate(NOW);
    p4.selectMovie();
    p4.inviteUser([PARTICIPANT_1_EMAIL, PARTICIPANT_2_EMAIL]);
    // We need to wait to fetch the invited user
    p4.copyGuests();
    // The users will get fetched from the DB, so we need to wait for it to render
    // This takes unusually long 
    cy.wait(10000);
    p4.verifyUsersInvitation(PARTICIPANT_1_NAME);
    p4.verifyUsersInvitation(PARTICIPANT_2_NAME);
    p4.saveEvent();
    const p5 = p4.goToDashboard();
    p5.logout();
  });

  it(`${PARTICIPANT_1_NAME} logs in and accepts hisinvitations and logs out`, () => {
    signIn({ email: PARTICIPANT_1_EMAIL, password: PASSWORD });
    cy.wait(1000)
    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToInvitations();
    cy.wait(500)
    p2.acceptInvitation()
    const p3 = p1.goToDashboard();
    p3.logout()
  });

  it(`${PARTICIPANT_2_NAME} in and accepts her invitations and logs out`, () => {
    signIn({ email: PARTICIPANT_2_EMAIL, password: PASSWORD });
    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToInvitations();
    cy.wait(500)
    p2.acceptInvitation()
    const p3 = p1.goToDashboard();
    p3.logout()
  });

  it('Event create logs in and verifies the accepted invitations', () => {
    cy.visit('/auth/welcome');
    signIn(LOGIN_CREDENTIALS);
    const p1 = new FestivalMarketplaceHomePage();
    const p2 = p1.goToNotifications()
    p2.verifyNotification(PARTICIPANT_1_NAME);
    p2.verifyNotification(PARTICIPANT_2_NAME);
  });
});