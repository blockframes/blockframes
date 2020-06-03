const PRIVATE = 'Private Screening';

export default class FestivalScreeningPage {
  constructor() {
    cy.get('festival-screening');
  }

  assertScreeningsExists(screeningName: string) {
    cy.wait(1000);
    cy.get('festival-screening event-screening-item').should('have.length', 4).contains(screeningName);
  }

  clickAskForInvitation() {
    cy.get('festival-screening event-screening-item').contains(PRIVATE).first().parent().parent().find('button[test-id=invitation-request]').click();
    cy.wait(3000);
  }
}
