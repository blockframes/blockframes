import { TO } from '@blockframes/e2e/utils';

export default class FestivalMarketplaceNotificationsPage {
  constructor() {
    cy.get('notification-view', {timeout: TO.PAGE_LOAD});
  }

  verifyNotification(message: string, accepted: boolean) {
    const notification = accepted ? 'accepted' : 'declined';
    cy.get('notification-item p[test-id=notification-message]', {timeout: TO.PAGE_ELEMENT})
      .contains(message).contains(notification)
  }
}
