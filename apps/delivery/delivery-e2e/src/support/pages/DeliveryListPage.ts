import DeliveryFormPage from "./DeliveryMaterialsPage";
import StarterPickerPage from "./delivery-create-tunnel/StarterPickerPage";

export default class DeliveryListPage {
  constructor() {
    cy.get('[page-id=delivery-list]', { timeout: 10000 });
  }

  public clickAddDelivery(): StarterPickerPage {
    cy.get('button').contains('Add a delivery').click();
    return new StarterPickerPage();
  }

  public assertDeliveryExists(orgName: string) {
    cy.get('.delivery-card').should('contain', orgName);
  }

  public clickFirstDelivery(orgName1: string, orgName2?: string) {
    orgName2
      ? cy.get('tr[test-id=delivery-row]').contains(orgName1 && orgName2).first().click()
      : cy.get('tr[test-id=delivery-row]').contains(orgName1).first().click()
    return new DeliveryFormPage();
  }

  public assertDeliveryIsDeleted() {
    cy.get('tr[test-id=delivery-row]').should('have.length', 1);
  }
}
