import TemplateListPage from "./TemplateListPage";

export default class TemplateDeleteModal {
  constructor() {}

  public clickConfirm() {
    cy.get('button[testId=confirm]').click();
    return new TemplateListPage();
  }
}
