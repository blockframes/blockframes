import FestivalMarketplaceEventPage from "../marketplace/FestivalMarketplaceEventPage";
import { TO } from '@blockframes/e2e/utils';

const ACCEPTED = 'Accepted';

export default class FestivalInvitationsPage {
  constructor() {
    cy.get('invitation-view', {timeout: 30000});
  }

  acceptInvitationScreening() {
    cy.get('invitation-view [test-id=more]', {timeout: 30000})
      .first().click();
    cy.get('[test-id=accept-invitation]', {timeout: 3000}).click();
    cy.wait(TO.SLOW_OP);
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
