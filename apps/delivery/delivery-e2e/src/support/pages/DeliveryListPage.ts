import TemplatePickerPage from "./TemplatePickerPage";
import DeliveryFormPage from "./DeliveryFormPage";

export default class DeliveryListPage {
  constructor() {
  }

  public clickAddDelivery() {
    cy.get('button.add-delivery').click();
    return new TemplatePickerPage();
  }

  public assertDeliveryExists(orgName: string) {
    cy.get('.delivery-card').should('contain', orgName);
  }

  public clickDelivery(orgName1: string, orgName2?: string) {
    orgName2
      ? cy.get('.delivery-card').contains(orgName1 && orgName2).click()
      : cy.get('.delivery-card').contains(orgName1).click()
    return new DeliveryFormPage();
  }

  public assertDeliveryIsDeleted() {
    cy.get('.delivery-card').should('have.length', 0);
  }
}
