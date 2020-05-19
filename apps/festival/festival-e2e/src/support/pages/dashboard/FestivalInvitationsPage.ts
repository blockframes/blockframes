const ACCEPTED = 'Accepted';

export default class FestivalInvitationsPage {
  constructor() {
    cy.get('festival-invitation')
  }

  acceptInvitation() {
    cy.get('festival-invitation invitation-list invitation-item a[test-id=invitation-accept]').click();
    cy.wait(3000);
  }

  refuseInvitation() {
    cy.get('festival-invitation invitation-list invitation-item a[test-id=invitation-refuse]').click()
  }

  assertInvitationIsAccepted() {
    cy.get('festival-invitation invitation-list invitation-item').contains(ACCEPTED);
  }
}
