import DeliveryMaterialsPage from "../DeliveryMaterialsPage";

export default class SettingsPage {
  constructor() {
    cy.get('[page-id=delivery-settings]');
  }

  public selectSetting(setting: string) {
    cy.get('mat-list-option').contains(setting).click();
  }

  public clickContinue(): DeliveryMaterialsPage {
    cy.get('button').contains('Continue').click();
    return new DeliveryMaterialsPage
  }

}
