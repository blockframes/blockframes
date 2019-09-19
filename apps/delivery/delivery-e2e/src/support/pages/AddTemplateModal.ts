import TemplateEditablePage from "./template/TemplateEditablePage";

export default class AddTemplateModal {
  constructor() {
    cy.contains('Add a new template');
  }

  public fillTemplateName(name: string) {
    cy.get('[testId=templateName]').type(name);
  }

  public clickCreate() {
    cy.get('[testId=templateCreate]').click();
    return new TemplateEditablePage();
  }
}
