/// <reference types="cypress" />

// Pages
import { FestivalMarketplaceHomePage, FestivalOrganizationListPage, FestivalMarketplaceOrganizationTitlePage, FestivalScreeningPage } from '../../support/pages/marketplace/index'
import { FestivalDashboardHomePage } from '../../support/pages/dashboard/index';
import { EventPage } from '../../support/pages/dashboard/index';
import { EventEditPage } from '../../support/pages/dashboard/index'

// Hooks
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { NOW, TOMORROW, EVENTNAME, USER_1, USER_2, ORG_NAME } from '../../fixtures/data';

let tomorrow = TOMORROW

beforeEach(() => {
  clearDataAndPrepareTest();
  tomorrow = new Date(NOW);
});

describe('User create a screening', () => {
  it('User creates a private screening, that taking place right now', () => {
    signIn(USER_1);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(NOW);
    p4.addEventTitle(EVENTNAME)
    p4.checkPrivate();
    p4.selectDate(NOW)
    p4.selectMovie()
    p4.saveEvent()
  })
  it('User creates a public screening, that taking place right now', () => {
    signIn(USER_1);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(NOW);
    p4.addEventTitle(EVENTNAME)
    p4.selectDate(NOW)
    p4.selectMovie()
    p4.saveEvent()
  })
  it('User creates a private screening, that taking place tomorrow', () => {
    signIn(USER_1);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(tomorrow);
    p4.addEventTitle(EVENTNAME)
    p4.checkPrivate();
    p4.selectDate(tomorrow)
    p4.selectMovie()
    p4.saveEvent()
  })
  it('User creates a private screening, that taking place tomorrow', () => {
    signIn(USER_1);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(tomorrow);
    p4.addEventTitle(EVENTNAME)
    p4.selectDate(tomorrow)
    p4.selectMovie()
    p4.saveEvent()
  })

  it('Verify the screening page and created screenings', () => {
    signIn(USER_2);
    const p1 = new FestivalMarketplaceHomePage();
    p1.clickOnMenu();
    const p2: FestivalOrganizationListPage = p1.selectSalesAgents();
    const p3: FestivalMarketplaceOrganizationTitlePage = p2.clickOnOrganization(ORG_NAME);
    const p4: FestivalScreeningPage = p3.clickOnSalesAgents();
    p4.assertScreeningsExists(EVENTNAME);
    // TODO: #2689 verify the eventName in each event view page
  })
});
