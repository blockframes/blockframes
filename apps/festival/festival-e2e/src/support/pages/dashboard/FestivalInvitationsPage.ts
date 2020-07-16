import FestivalMarketplaceEventPage from "../marketplace/FestivalMarketplaceEventPage";

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
    cy.get('festival-invitation [test-id=more]').first().click();
    cy.get('[test-id=accept-invitation]').click();
  }

  refuseInvitationScreening() {
    cy.get('festival-invitation [test-id=more]').first().click();
    cy.get('[test-id=decline-invitation]').click();
  }

  assertInvitationIsAccepted() {
    cy.get('festival-invitation invitation-list invitation-item').contains(ACCEPTED);
  }

  clickGoToEvent() {
    cy.get('festival-invitation [test-id=more]').first().click();
    cy.get('[test-id=go-to-event]').click();
    return new FestivalMarketplaceEventPage();
  }
}
