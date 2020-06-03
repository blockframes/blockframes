/// <reference types="cypress" />

// Pages
import {
  FestivalMarketplaceHomePage,
  FestivalOrganizationListPage,
  FestivalMarketplaceOrganizationTitlePage,
  FestivalScreeningPage
} from '../../support/pages/marketplace/index';
import {
  FestivalDashboardHomePage,
  FestivalInvitationsPage,
  EventPage,
  EventEditPage
} from '../../support/pages/dashboard/index';

// Hooks
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { NOW, TOMORROW, EVENTNAME, USER_1, USER_2, ORG_NAME } from '../../fixtures/data';
import { MOVIES } from '@blockframes/e2e/utils/movies';
import FestivalMarketplaceNotifications from '../../support/pages/marketplace/FestivalMarketplaceNotificationsPage';

let tomorrow = TOMORROW;
const MOVIE_TITLE = MOVIES[3].title.international;

describe('User create a screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest();
    tomorrow = new Date(NOW);
  });

  it('User creates a private screening, that taking place right now', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    const p3: EventEditPage = p2.createDetailedEvent(NOW);
    p3.addEventTitle(EVENTNAME);
    p3.checkPrivate();
    p3.selectDate(NOW);
    p3.selectMovie(MOVIE_TITLE);
    p3.saveEvent();
  });
  it('User creates a public screening, that taking place right now', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    const p3: EventEditPage = p2.createDetailedEvent(NOW);
    p3.addEventTitle(EVENTNAME);
    p3.selectDate(NOW);
    p3.selectMovie(MOVIE_TITLE);
    p3.saveEvent();
  });
  it('User creates a private screening, that taking place tomorrow', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    const p3: EventEditPage = p2.createDetailedEvent(tomorrow);
    p3.addEventTitle(EVENTNAME);
    p3.checkPrivate();
    p3.selectDate(tomorrow);
    p3.selectMovie(MOVIE_TITLE);
    p3.saveEvent();
  });
  it('User creates a private screening, that taking place tomorrow', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: EventPage = p1.goToCalendar();
    const p3: EventEditPage = p2.createDetailedEvent(tomorrow);
    p3.addEventTitle(EVENTNAME);
    p3.selectDate(tomorrow);
    p3.selectMovie(MOVIE_TITLE);
    p3.saveEvent();
  });

  it('Verify the screening page and created screenings', () => {
    signIn(USER_2);
    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(ORG_NAME);
    const p4: FestivalScreeningPage = p3.clickOnSalesAgents();
    p4.assertScreeningsExists(EVENTNAME);
    // TODO: #2689 verify the eventName in each event view page
  });

  it("Request invitation's screening", () => {
    signIn(USER_2);
    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(ORG_NAME);
    const p4: FestivalScreeningPage = p3.clickOnSalesAgents();
    p4.clickAskForInvitation();
  });

  it('Accept screening request', () => {
    signIn(USER_1);
    const p1 = new FestivalDashboardHomePage();
    const p2: FestivalInvitationsPage = p1.clickOnInvitations();
    p2.acceptInvitation();
  });

  it('Verify that request is accepted', () => {
    signIn(USER_2);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalMarketplaceNotifications = p1.goToNotifications();
    p2.verifyNotification(ORG_NAME, true);
  });
});
