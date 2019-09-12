import DeliveryListPage from './DeliveryListPage';

export default class DeleteDeliveryModal {
  constructor() {
    cy.get('[page-id=confirm-modal]', { timeout: 10000 });
  }

  public confirmDelete(): DeliveryListPage {
    cy.get('button[test-id=confirm]').click();
    return new DeliveryListPage();
  }
}
