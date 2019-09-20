import DeliveryEditablePage from "./delivery/DeliveryEditablePage";

export default class SaveAsTemplateModal {
  constructor() {
    cy.get('[page-id=save-as-template]', {timeout: 10000});
  }

  public fillName(templateName: string) {
    cy.get('[page-id=save-as-template] input').type(templateName);
  }

  public clickSave() {
    cy.get('[page-id=save-as-template] button[test-id=save]').click();
    return new DeliveryEditablePage();
  }

  public clickUpdate() {
    cy.get('[page-id=save-as-template] button[test-id=update]').click();
    return new DeliveryEditablePage();
  }
}
