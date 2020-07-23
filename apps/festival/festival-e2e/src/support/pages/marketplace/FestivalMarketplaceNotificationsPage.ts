export default class FestivalMarketplaceNotificationsPage {
  constructor() {
    cy.get('notification-view')
  }

  verifyNotification(message: string, accepted: boolean) {
    accepted ? cy.get('notification-item p[test-id=notification-message]').contains(message).contains('accepted')
      : cy.get('notification-item p[test-id=notification-message]').contains(message).contains('declined')
  }
}
