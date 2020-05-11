export default class FestivalScreeningPage {
  constructor() {
    cy.get('festival-screening');
  }

  assertScreeningsExists(screeningName: string) {
    cy.get('festival-screening event-screening-item').should('have.length', 4).contains(screeningName);
  }
}
