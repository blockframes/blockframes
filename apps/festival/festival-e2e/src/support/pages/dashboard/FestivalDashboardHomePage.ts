import EventPage from './EventPage';

export default class FestivalDashboardHomePage {
  constructor() {
    cy.get('festival-dashboard-home')
  }

  goToCalendar(){
    cy.get('a[test-id=calendar]').click();
    return new EventPage();
  }
}