import DeliverySettingsFormPage from "./DeliverySettingsFormPage";

export default class TemplatePickerPage {
  constructor() {
    cy.contains('Blank');
  }

  public clickCreateNewDelivery() {
    cy.wait(500);
    cy.get('span.blank').click();
    return new DeliverySettingsFormPage();
  }

  public clickTemplateDelivery(templateName: string) {
    cy.wait(1500);
    cy.get('.ng-star-inserted > .mat-card')
      .contains(templateName).click();
    return new DeliverySettingsFormPage();
  }
}
