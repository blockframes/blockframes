import TemplateDeleteModal from "./TemplateDeleteModal";
import TemplateListPage from "./TemplateListPage";

export default class TemplateFormPage {
  constructor() {
    cy.contains('Add a material')
  }

  public deleteTemplate() {
    cy.get('button.delete-template').click();
    return new TemplateDeleteModal();
  }

  public clickDeleteMaterial(value: string) {
    cy.get('mat-card')
    .contains(value)
    .parent().parent()
    .trigger('mouseover')
    .find('button').contains('DELETE').click({force: true});
  }

  public clickEditMaterial(value: string) {
    cy.get('mat-card')
    .contains(value)
    .parent().parent()
    .trigger('mouseover')
    .find('button').contains('EDIT').click({force: true});
  }

  public assertMaterialExists(value: string, description: string, category: string) {
    cy.get('mat-card').should((card) => expect(card).to.contain(value).to.contain(description));
    cy.get('h3').contains(category).should('have.length', '1');
  }

  public clickAdd() {
    cy.get('mat-sidenav button.create-material').click();
  }

  public fillValue(materialValue: string) {
    cy.get('input.value').type(materialValue);
  }

  public clearValue() {
    cy.get('input.value').clear();
  }

  public fillDescription(materialDescription: string) {
    cy.get('textarea.description').type(materialDescription);
  }

  public clearDescription() {
    cy.get('textarea.description').clear();
  }

  public fillCategory(materialCategory: string) {
    cy.get('input.category').type(materialCategory);
  }

  public clearCategory() {
    cy.get('input.category').clear();
  }

  public clickSaveMaterial() {
    cy.get('button.add-button').click();
  }

  public assertMaterialsCount(materialsLength: number) {
    cy.get('mat-card').should('have.length', materialsLength);
  }

  public selectTemplates() {
    cy.get('a').contains('templates').click();
    return new TemplateListPage;
  }
}
