import { NewTemplatePage } from ".";

export default class TemplateCreatePage {
  constructor() {
    cy.get('[page-id=template-create]', {timeout: 10000});
  }

  public clickNewTemplate() {
    cy.get('[page-id=template-create] button').click();
    return new NewTemplatePage();
  }

}
