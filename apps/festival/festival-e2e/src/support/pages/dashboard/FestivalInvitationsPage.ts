export default class FestivalInvitationsPage {
  constructor() {
    cy.get('festival-invitation')
  }

  acceptInvitation() {
    cy.get('festival-invitation invitation-list invitation-item a[test-id=accept]').click({multiple: true})
  }
}