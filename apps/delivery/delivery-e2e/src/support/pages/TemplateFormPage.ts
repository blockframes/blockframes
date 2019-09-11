import TemplateListPage from "./TemplateListPage";
import { Material } from "../utils/type";
import NavbarPage from "./NavbarPage";

export default class TemplateFormPage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=template-editable]');
  }

  public addMaterial() { // open the sidenav
    cy.get('[page-id=template-editable] button[test-id=add]').click();
  }

  public assertValues(title: string, category: string, description: string) {
    cy.get('[page-id=template-material-list] tr').should( tr => expect(tr).to.contain(title).to.contain(category).to.contain(description));
  }

  // public assertMaterialExists(value: string, description: string, category: string) {
  //   cy.get('mat-card').should((card) => expect(card).to.contain(value).to.contain(description));
  //   cy.get('h3').contains(category).should('have.length', '1');
  // }

  public fillTitle(title: string) {
    cy.get('[page-id=template-form] input[test-id=title]').type(title);
  }

  public fillCategory(category: string) {
    cy.get('[page-id=template-form] input[test-id=category]').type(category);
  }

  public fillDescription(description: string) {
    cy.get('[page-id=template-form] textarea').type(description);
  }

  // public clearValue() {
  //   cy.get('input.value').clear();
  // }

  // public fillDescription(materialDescription: string) {
  //   cy.get('textarea.description').type(materialDescription);
  // }

  // public clearDescription() {
  //   cy.get('textarea.description').clear();
  // }

  // public fillCategory(materialCategory: string) {
  //   cy.get('input.category').type(materialCategory);
  // }

  // public clearCategory() {
  //   cy.get('input.category').clear();
  // }

  // public clickSaveMaterial() {
  //   cy.get('button.add-button').click();
  // }

  // public assertMaterialsCount(materialsLength: number) {
  //   cy.get('mat-card').should('have.length', materialsLength);
  // }

  public selectTemplates() {
    cy.get('a').contains('templates').click();
    return new TemplateListPage();
  }
}
