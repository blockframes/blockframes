import DeliveryListPage from './delivery/DeliveryListPage';
import DeliveryEditablePage from './delivery/DeliveryEditablePage';

export default class ConfirmModal {
  constructor() {
    cy.get('[page-id=confirm-modal]', { timeout: 10000 });
  }

  public confirmDeleteDelivery(): DeliveryListPage {
    cy.get('[page-id=confirm-modal] button[test-id=confirm]').click();
    return new DeliveryListPage();
  }

  public confirmDeleteMaterial(): DeliveryEditablePage {
    cy.get('[page-id=confirm-modal] button[test-id=confirm]').click();
    return new DeliveryEditablePage();
  }
}
