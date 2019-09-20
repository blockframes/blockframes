import DeliveryListPage from './DeliveryListPage';

export default class ConfirmModal {
  constructor() {
    cy.get('[page-id=confirm-modal]', { timeout: 10000 });
  }

  public confirmDeleteDelivery(): DeliveryListPage {
    cy.get('[page-id=confirm-modal] button[test-id=confirm]').click();
    return new DeliveryListPage();
  }
}
