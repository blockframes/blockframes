export default class FestivalMarketplaceNotificationsPage {
  constructor() {
    cy.get('notification-view', {timeout: 30000});
  }

  verifyNotification(message: string, accepted: boolean) {
    const notification = accepted ? 'accepted' : 'declined';
    cy.get('notification-item p[test-id=notification-message]')
      .contains(message).contains(notification)
  }
}
