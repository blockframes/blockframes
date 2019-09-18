import TemplateFormPage from "./TemplateFormPage";

export default class TemplateListPage {

  constructor() {
    cy.get('[page-id=template-list]', {timeout: 10000});
  }

  //-------------------------------------
  //               CLICK
  //-------------------------------------
  public editTemplate(name: string) {
    cy.get('[page-id=template-repertory] tr')
    .contains(name).click();
    return new TemplateFormPage();
  }

  public deleteTemplate(name: string) {
    cy.get('[page-id=template-repertory] tr')
    .contains(name).parent().parent().find('button').click();
  }

  //-------------------------------------
  //               ASSERT
  //-------------------------------------

  public assertTemplateExists(name: string) {
    cy.get('[page-id=template-repertory] tr').should( tr =>
      expect(tr)
        .to.contain(name)
    );
  }

  public assertNoTemplatesExists() {
    cy.get('[page-id=template-repertory] tr').should( tr =>
      expect(tr).length(1)
    );
  }
}
