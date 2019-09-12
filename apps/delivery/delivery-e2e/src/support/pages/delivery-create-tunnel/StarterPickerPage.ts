import { SettingsPage, TemplatePickerPage } from "..";

export default class StarterPickerPage {
  constructor() {
    cy.get('[page-id=starter-picker]', { timeout: 5000 });
  }

  public clickFromScratchStarter(): SettingsPage {
    cy.get('mat-list-item').contains('From scratch').click();
    return new SettingsPage();
  }

  public clickTemplateStarter(): TemplatePickerPage {
    cy.get('mat-list-item').contains('From an existing template').click();
    return new TemplatePickerPage();
  }

  public clickMaterialsStarter():SettingsPage {
    cy.get('mat-list-item').contains('From existing materials').click();
    return new SettingsPage();
  }
}
