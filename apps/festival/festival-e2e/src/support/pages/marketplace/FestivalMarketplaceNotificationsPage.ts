import { SEC } from '@blockframes/e2e/utils';

export default class FestivalMarketplaceNotificationsPage {
  constructor() {
    cy.get('notification-view', {timeout: 60 * SEC});
  }

  verifyNotification(message: string, accepted: boolean) {
    const notification = accepted ? 'accepted' : 'declined';
    cy.get('notification-item p[test-id=notification-message]', {timeout: 3 * SEC})
      .contains(message).contains(notification)
  }
}
