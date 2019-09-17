import StarterPickerPage from "./delivery-create-tunnel/StarterPickerPage";
import DeliveryMaterialsPage from "./DeliveryMaterialsPage";

export default class DeliveryListPage {
  constructor() {
    cy.get('[page-id=delivery-list]', { timeout: 10000 });
  }

  public clickAddDelivery(): StarterPickerPage {
    cy.get('[page-id=delivery-list] button[test-id=add-delivery]').click();
    return new StarterPickerPage();
  }

  public clickFirstDelivery(orgName1: string, orgName2?: string): DeliveryMaterialsPage {
    orgName2
      ? cy.get('[page-id=delivery-list] tr[test-id=delivery-row]').contains(orgName1 && orgName2).first().click()
      : cy.get('[page-id=delivery-list] tr[test-id=delivery-row]').contains(orgName1).first().click()
    return new DeliveryMaterialsPage();
  }

  public clickLastDelivery(orgName) {
    cy.get('[page-id=delivery-list] tr[test-id=delivery-row]').contains(orgName).last().click();
    return new DeliveryMaterialsPage();
  }

  public assertDeliveryIsDeleted() {
    cy.get('[page-id=delivery-list] tr[test-id=delivery-row]').should('have.length', 1);
  }
}
