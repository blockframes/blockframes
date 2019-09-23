import StarterPickerPage from "../delivery-create-tunnel/StarterPickerPage";
import DeliveryEditablePage from "./DeliveryEditablePage";

export default class DeliveryListPage {
  constructor() {
    cy.get('[page-id=delivery-list]', { timeout: 20000 });
  }

  public clickAddDelivery(): StarterPickerPage {
    cy.get('[page-id=delivery-list] button[test-id=add-delivery]').click();
    return new StarterPickerPage();
  }

  public clickFirstDelivery(orgName1: string, orgName2?: string): DeliveryEditablePage {
    orgName2
      ? cy.get('[page-id=delivery-list] tr[test-id=delivery-row]').contains(orgName1 && orgName2).first().click()
      : cy.get('[page-id=delivery-list] tr[test-id=delivery-row]').contains(orgName1).first().click()
    return new DeliveryEditablePage();
  }

  public clickLastDelivery(orgName) {
    cy.get('[page-id=delivery-list] tr[test-id=delivery-row]').last().contains(orgName).click();
    return new DeliveryEditablePage();
  }

  public assertDeliveryIsDeleted() {
    cy.get('[page-id=delivery-list] tr[test-id=delivery-row]').should('have.length', 1);
  }
}
