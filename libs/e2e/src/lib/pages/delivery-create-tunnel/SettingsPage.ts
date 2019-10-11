import DeliveryEditablePage from "../delivery/DeliveryEditablePage";

export default class SettingsPage {
  constructor() {
    cy.get('[page-id=delivery-settings]', { timeout: 10000 });
  }

  public selectSetting(setting: string) {
    cy.get('[page-id=delivery-settings] mat-list-option').contains(setting).click();
  }

  public clickContinue(): DeliveryEditablePage {
    cy.get('[page-id=delivery-settings] button[test-id=continue]').click();
    return new DeliveryEditablePage
  }

}
