import FestivalMarketplaceEventPage from "../marketplace/FestivalMarketplaceEventPage";

const ACCEPTED = 'Accepted';

export default class FestivalInvitationsPage {
  constructor() {
    cy.get('invitation-view')
  }

  acceptInvitationScreening() {
    cy.get('invitation-view [test-id=more]').first().click();
    cy.get('[test-id=accept-invitation]').click();
    cy.wait(2000);
  }

  refuseInvitationScreening() {
    cy.get('invitation-view [test-id=more]').first().click();
    cy.get('[test-id=decline-invitation]').click();
    cy.wait(2000);
  }

  assertInvitationIsAccepted() {
    cy.get('invitation-view invitation-list invitation-item').contains(ACCEPTED);
  }

  openMoreMenu() {
    cy.get('invitation-view [test-id=more]').first().click();
  }

  clickGoToEvent() {
    cy.get('[test-id=go-to-event]').click();
    return new FestivalMarketplaceEventPage();
  }
}
