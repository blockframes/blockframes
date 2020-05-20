const ACCEPTED = 'Accepted';

export default class FestivalInvitationsPage {
  constructor() {
    cy.get('festival-invitation')
  }

  acceptInvitation() {
    cy.get('festival-invitation invitation-list invitation-item a[test-id=invitation-accept]').click();
  }

  acceptInvitationScreening() {
    cy.get('festival-invitation invitation-list invitation-item button[test-id=invitation-accept]').click();
  }

  refuseInvitationScreening() {
    cy.get('festival-invitation invitation-list invitation-item button[test-id=invitation-refuse]').click()
  }

  assertInvitationIsAccepted() {
    cy.get('festival-invitation invitation-list invitation-item').contains(ACCEPTED);
  }
}
