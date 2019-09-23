import SettingsPage from "./SettingsPage";
import TemplatePickerPage from "./TemplatePickerPage";

export default class StarterPickerPage {
  constructor() {
    cy.get('[page-id=starter-picker]', { timeout: 10000 });
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
