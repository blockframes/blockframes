import DeliveryFormPage from "./DeliveryMaterialsPage";

export default class NewTemplatePage {
  constructor() {
    cy.contains('Save as a new template');
  }

  public openSelect() {
    cy.get('mat-select').click();
  }

  public pickOrganization(orgName: string) {
    cy.get('mat-option').contains(orgName).click();
  }

  public fillName(templateName: string) {
    cy.get('input[formcontrolname=name]').type(templateName);
  }

  public clickSave() {
    cy.get('button').contains('Save Template').click();
    return new DeliveryFormPage();
  }
}
