import FestivalMarketplaceScreeningPage from "../marketplace/FestivalMarketplaceScreeningPage";
import { SEC } from '@blockframes/e2e/utils';

const ACCEPTED = 'Accepted';

export default class FestivalInvitationsPage {
  constructor() {
    cy.get('invitation-view', {timeout: 30 * SEC});
  }

  acceptInvitationScreening() {
    cy.get('invitation-view [test-id=more]', {timeout: 30 * SEC})
      .first().click();
    cy.get('[test-id=accept-invitation]', {timeout: 3 * SEC}).click();
    cy.wait(10 * SEC);
  }

  refuseInvitationScreening() {
    cy.get('invitation-view [test-id=more]').first().click();
    cy.get('[test-id=decline-invitation]').click();
    cy.wait(2 * SEC);
  }

  assertInvitationIsAccepted() {
    cy.get('invitation-view invitation-list invitation-item').contains(ACCEPTED);
  }

  openMoreMenu() {
    cy.get('invitation-view [test-id=more]').first().click();
  }

  clickGoToEvent() {
    cy.get('[test-id=go-to-event]').click();
    return new FestivalMarketplaceScreeningPage();
  }
}
