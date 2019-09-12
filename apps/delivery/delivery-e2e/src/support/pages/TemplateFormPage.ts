import TemplateListPage from "./TemplateListPage";
import { Material } from "../utils/type";
import NavbarPage from "./NavbarPage";

export default class TemplateFormPage extends NavbarPage {
  constructor() {
    super();
    cy.wait(7000);
    cy.get('[page-id=template-editable]');
  }

  //-------------------------------------
  //               CLICK
  //-------------------------------------

  public addMaterial() { // open the sidenav
    cy.get('[page-id=template-editable] button[test-id=add]').click();
  }

  public saveMaterial() {
    cy.get('[page-id=template-editable] button[test-id=save]').click();
  }

  public editMaterial(material: Material) {
    cy.get('[page-id=template-material-list] tr')
    .contains(material.title).parent().parent().find('button').click();
  }

  public deleteMaterial() {
    cy.get('[page-id=template-form] button').click();
  }

  //-------------------------------------
  //               FILL
  //-------------------------------------

  public fillMaterial(material: Material) {
    this.fillTitle(material.title);
    this.fillCategory(material.category);
    this.fillDescription(material.description);
  }

  public fillTitle(title: string) {
    cy.get('[page-id=template-form] input[test-id=title]').type(title);
  }

  public fillCategory(category: string) {
    cy.get('[page-id=template-form] input[test-id=category]').type(category);
  }

  public fillDescription(description: string) {
    cy.get('[page-id=template-form] textarea').type(description);
  }

  public clearMaterial() {
    this.clearTitle();
    this.clearCategory();
    this.clearDescription();
  }

  public clearTitle() {
    cy.get('[page-id=template-form] input[test-id=title]').clear();
  }

  public clearCategory() {
    cy.get('[page-id=template-form] input[test-id=category]').clear();
  }

  public clearDescription() {
    cy.get('[page-id=template-form] textarea').clear();
  }

  //-------------------------------------
  //               ASSERT
  //-------------------------------------

  public assertMaterial(material: Material) {
    cy.get('[page-id=template-material-list] tr').should( tr =>
      expect(tr)
        .to.contain(material.title)
        .to.contain(material.category)
        .to.contain(material.description)
    );
  }

  public assertNoMaterials() {
    cy.get('[page-id=template-material-list] tr').should( tr =>
      expect(tr).length(1)
    );
  }

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
