import TemplateFormPage from "./TemplateFormPage";
import HomePage from "./HomePage";
import AddTemplateModal from "./AddTemplateModal";

export default class TemplateListPage {

  constructor() {
    cy.wait(1000);
    cy.get('[page-id=template-list]');
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

  public assertTemplate(name: string) {
    cy.get('[page-id=template-repertory] tr').should( tr =>
      expect(tr)
        .to.contain(name)
    );
  }

  public assertNoTemplates() {
    cy.get('[page-id=template-repertory] tr').should( tr =>
      expect(tr).length(1)
    );
  }
}
