import TemplateFormPage from "./TemplateFormPage";
import HomePage from "./HomePage";
import AddTemplateModal from "./AddTemplateModal";

export default class TemplateListPage {
  constructor() {
  }

  public selectTemplate(templateName: string) {
    cy.wait(500);
    cy.get('mat-card').contains(templateName).click();
    return new TemplateFormPage();
  }

  public assertTemplateDoesNotExists(templateName: string) {
    cy.contains(templateName).should('have.length', 0);
  }

  public clickDelete() {
    cy.get('span').contains('Delete').click({force: true});
  }

  public createTemplate() {
    cy.get('button.add-template').click();
    return new AddTemplateModal();
  }

  public assertTemplateExists(templateName: string) {
    cy.wait(1000);
    cy.get('mat-card').contains(templateName).should('have.length', 1);
  }

  public displayTemplateMenu(templateName: string) {
    cy.wait(1000);
    cy.get('mat-card').contains(templateName).parent().parent().find('button.trigger').click({force: true});
  }

  public clickEdit() {
    cy.get('span').contains('Edit').click({force: true});
    return new TemplateFormPage();
  }

  public openExpansionPanel(orgName: string) {
    cy.get('.mat-expansion-panel-header-title').contains(orgName).click();
  }

  public deleteTemplate() {
    cy.get('span').contains('Delete').click({force: true});
  }

  public selectHome() {
    cy.get('.mat-tab-links').get('a').contains('home').click();
    return new HomePage();
  }

  public assertTemplateIsDeleted(templateName: string) {
    cy.get('.template-item').contains(templateName).should('have.length', 0);
  }
}
