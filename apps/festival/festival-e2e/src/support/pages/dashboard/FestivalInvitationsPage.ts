import FestivalMarketplaceEventPage from "../marketplace/FestivalMarketplaceEventPage";

const ACCEPTED = 'Accepted';

export default class FestivalInvitationsPage {
  constructor() {
    cy.get('festival-invitation')
  }

  acceptInvitationScreening() {
    cy.get('festival-invitation [test-id=more]').first().click();
    cy.get('[test-id=accept-invitation]').click();
    cy.wait(2000);
  }

  refuseInvitationScreening() {
    cy.get('festival-invitation [test-id=more]').first().click();
    cy.get('[test-id=decline-invitation]').click();
    cy.wait(2000);
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
