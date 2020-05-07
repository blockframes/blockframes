/// <reference types="cypress" />

// Pages
import { FestivalMarketplaceHomePage } from '../../support/pages/marketplace/index'
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
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];
const EVENTNAME = 'test screening';

beforeEach(() => {
  clearDataAndPrepareTest();
  TOMORROW = new Date(NOW);
  signIn(LOGIN_CREDENTIALS);
});

describe('User create a screening', () => {
  it('User creates a private screening, that taking place right now', () => {
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
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(TOMORROW);
    p4.addEventTitle(EVENTNAME)
    p4.selectDate(TOMORROW)
    p4.selectMovie()
    p4.saveEvent()
  })
});