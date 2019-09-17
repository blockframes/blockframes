import TemplateListPage from "./TemplateListPage";
import { Material } from "../utils/type";
import NavbarPage from "./NavbarPage";

export default class TemplateFormPage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=template-editable]');
  }

  public assertMaterialExists(material: Material) {
    cy.get('[page-id=template-material-list] tr').should( tr =>
      expect(tr)
        .to.contain(material.title)
        .to.contain(material.category)
        .to.contain(material.description)
    );
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
    return new TemplateListPage();
  }
}
