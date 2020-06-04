const ACCEPTED = 'Accepted';

export default class FestivalInvitationsPage {
  constructor() {
    cy.get('festival-invitation')
  }

  acceptInvitation() {
    cy.get('festival-invitation invitation-list invitation-item button[test-id=invitation-accept]').click();
    cy.wait(1000);
  }

  acceptInvitationScreening() {
    cy.get('festival-invitation invitation-list invitation-item button[test-id=invitation-accept]').click();
  }

  refuseInvitationScreening() {
    cy.get('festival-invitation invitation-list invitation-item button[test-id=invitation-refuse]').click();
  }

  assertInvitationIsAccepted() {
    cy.get('festival-invitation invitation-list invitation-item').contains(ACCEPTED);
  }
}
