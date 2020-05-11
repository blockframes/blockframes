export default class FestivalMarketplaceNotifications {
  constructor(){
    cy.get('festival-marketplace-notification')
  }

  verifyNotification(message: string) {
    cy.get('notification-item p[test-id=notification-message]').contains(message)
  }
}