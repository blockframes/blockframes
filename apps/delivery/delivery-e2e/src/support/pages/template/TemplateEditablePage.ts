import TemplateListPage from "./TemplateListPage";
import { Material } from "../../utils/type";
import NavbarPage from "../NavbarPage";

export default class TemplateEditablePage extends NavbarPage{
  constructor() {
    super();
    cy.get('[page-id=template-editable]', {timeout: 10000});
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
  //              FILL/CLEAR
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

  public assertMaterialExists(material: Material) {
    cy.get('[page-id=template-material-list] tr').should( tr =>
      expect(tr)
        .to.contain(material.title)
        .to.contain(material.category)
        .to.contain(material.description)
    );
  }

  public assertNoMaterialsExists() {
    cy.get('[page-id=template-material-list] tr').should( tr =>
      expect(tr).length(1)
    );
  }
}
