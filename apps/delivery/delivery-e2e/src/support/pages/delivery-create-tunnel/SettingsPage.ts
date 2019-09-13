import DeliveryMaterialsPage from "../DeliveryMaterialsPage";

export default class SettingsPage {
  constructor() {
    cy.get('[page-id=delivery-settings]', { timeout: 10000 });
  }

  public selectSetting(setting: string) {
    cy.get('[page-id=delivery-settings] mat-list-option').contains(setting).click();
  }

  public clickContinue(): DeliveryMaterialsPage {
    cy.get('[page-id=delivery-settings] button[test-id=continue]').click();
    return new DeliveryMaterialsPage
  }

}
