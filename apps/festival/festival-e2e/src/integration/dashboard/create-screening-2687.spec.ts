/// <reference types="cypress" />

// Pages
import FestivalMarketplaceHomePage from '../../support/pages/marketplace/FestivalMarketplaceHomePage'
import FestivalDashboardHomePage from '../../support/pages/dashboard/FestivalDashboardHomePage';
import EventPage from '../../support/pages/dashboard/EventPage';
import EventEditPage from '../../support/pages/dashboard/EventEditPage';

// Hooks
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User create a screening', () => {
  it('User creates a private screening, that taking place right now', () => {
    const now = new Date();
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(now);
    p4.addEventTitle('test screening')
    p4.checkPrivate();
    p4.selectDate(now)
    p4.selectMovie()
    p4.saveEvent()
  })
  it('User creates a public screening, that taking place right now', () => {
    const now = new Date();
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(now);
    p4.addEventTitle('test screening')
    p4.selectDate(now)
    p4.selectMovie()
    p4.saveEvent()
  })
  it('User creates a private screening, that taking place tomorrow', () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1)
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(tomorrow);
    p4.addEventTitle('test screening')
    p4.checkPrivate();
    p4.selectDate(tomorrow)
    p4.selectMovie()
    p4.saveEvent()
  })
  it('User creates a private screening, that taking place tomorrow', () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1)
    const p1 = new FestivalMarketplaceHomePage();
    const p2: FestivalDashboardHomePage = p1.goToDashboard();
    const p3: EventPage = p2.goToCalendar()
    const p4: EventEditPage = p3.createDetailedEvent(tomorrow);
    p4.addEventTitle('test screening')
    p4.selectDate(tomorrow)
    p4.selectMovie()
    p4.saveEvent()
  })
});