import TemplateEditablePage from "./TemplateEditablePage";


export default class TemplateAddModal {
  constructor() {
    cy.get('[page-id=template-add]', {timeout: 10000});
  }

  public fillName(templateName: string) {
    cy.get('[page-id=template-add] input').type(templateName);
  }

  public clickNext() {
    cy.get('[page-id=template-add] button[test-id=next]').click();
    return new TemplateEditablePage();
  }
}
