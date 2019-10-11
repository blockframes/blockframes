import SettingsPage from "./SettingsPage";

export default class TemplatePickerPage {
  constructor() {
    cy.get('[page-id=template-picker]', { timeout: 10000 });
  }

  public selectTemplate(templateName: string) {
    cy.get('[page-id=template-picker] mat-list-item').contains(templateName).click();
  }

  public clickContinue(): SettingsPage {
    cy.get('[page-id=template-picker] button[test-id=continue]').click();
    return new SettingsPage
  }

}
