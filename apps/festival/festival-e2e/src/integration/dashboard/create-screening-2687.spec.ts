/// <reference types="cypress" />

// Pages
import { FestivalMarketplaceHomePage, FestivalOrganizationListPage, FestivalMarketplaceOrganizationTitlePage, FestivalScreeningPage } from '../../support/pages/marketplace/index'
import { FestivalDashboardHomePage } from '../../support/pages/dashboard/index';
import { EventPage } from '../../support/pages/dashboard/index';
import { EventEditPage } from '../../support/pages/dashboard/index'

// Hooks
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';

// Utils
import { User } from '@blockframes/e2e/utils/type';
import { USERS } from '@blockframes/e2e/utils/users';

const NOW = new Date();
let TOMORROW = new Date(NOW);

// david.ewing@gillespie-lawrence.fake.cascade8.com
const USER_1: Partial<User> = USERS[0];
// john.bryant@love-and-sons.fake.cascade8.com
const USER_2: Partial<User> = USERS[4];

const ORG_NAME = 'main';

const EVENTNAME = 'test screening';

beforeEach(() => {
  clearDataAndPrepareTest();
  TOMORROW = new Date(NOW);
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
    const p4: EventEditPage = p3.createDetailedEvent(TOMORROW);
    p4.addEventTitle(EVENTNAME)
    p4.checkPrivate();
    p4.selectDate(TOMORROW)
    p4.selectMovie()
    p4.saveEvent()
  })
  it('User creates a private screening, that taking place tomorrow', () => {
    signIn(USER_1);
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(TOMORROW);
    p4.addEventTitle(EVENTNAME)
    p4.selectDate(TOMORROW)
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
