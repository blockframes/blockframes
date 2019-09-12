import SettingsPage from "./SettingsPage";

export default class TemplatePickerPage {
  constructor() {
    cy.get('[page-id=template-picker]');
  }

  public selectTemplate(templateName: string) {
    cy.get('mat-list-item').contains(templateName).click();
  }

  public clickContinue(): SettingsPage {
    cy.get('button').contains('Continue').click();
    return new SettingsPage
  }

}
