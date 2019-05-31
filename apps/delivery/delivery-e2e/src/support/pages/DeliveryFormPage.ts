import NavbarPage from "./NavbarPage";
import HomePage from "./HomePage";
import DeliveryListPage from "./DeliveryListPage";
import NewTemplatePage from "./NewTemplatePage";

export default class DeliveryFormPage extends NavbarPage {
  constructor() {
    super();
    cy.get('.delivery-form').should('contain', 'Sign delivery');
  }

  public verifyDeletedMaterial(value: string) {
    cy.get('mat-card').contains(value).should('have.length', 0);
  }

  public verifySignatures(count: number) {
    cy.get('mat-card-footer.footerSigned').should((footers) => {
      expect(footers).to.have.length(count) });
  }

  public clickSign() {
    cy.get('[testId=modalSign]').find('button').contains('Sign').click();
    cy.wait(3000);
  }

  public fillPassword(password: string) {
    cy.get('input[type="password"]').type(password);
  }

  public clickVerifyToSign() {
    cy.get('[testId=sign]').click();
  }

  public clickAddSignature() {
    cy.get('button').contains('Add signature').click();
  }

  public clickDeleteMaterial(value: string) {
    cy.wait(1000);
    cy.get('mat-card')
    .contains(value)
    .parent().parent()
    .trigger('mouseover')
    .find('button').contains('DELETE').click({force: true});
  }

  public clickCheckBoxMaterial(name: string) {
    cy.get('mat-card')
      .contains(name)
      .parent().parent()
      .find('.mat-checkbox-inner-container')
      .click();
  }

  public clickCheckBoxMaterials(names: string[]) {
    cy.wait(1000);
    names.forEach(name => this.clickCheckBoxMaterial(name));
  }

  public scrollToAction() {
    cy.get('button.action').scrollIntoView();
  }

  public clickButtonAction() {
    cy.get('button.action').click();
  }

  public clickChangeStep() {
    cy.get('button').contains('Change step').click();
  }

  public clickAddStep(stepName: string) {
    cy.get('button').contains(stepName).click();
  }

  public clickAdd() {
    cy.get('mat-sidenav button.create-material').click();
  }

  public fillValue(materialValue: string) {
    cy.get('input.value').type(materialValue);
  }

  public fillDescription(materialDescription: string) {
    cy.get('textarea.description').type(materialDescription);
  }

  public fillCategory(materialCategory: string) {
    cy.get('input.category').type(materialCategory);
  }

  public clickSaveMaterial() {
    cy.get('button.add-button').click();
  }

  public clickSaveAsTemplate() {
    cy.get('button').contains('Save as new template').click();
    return new NewTemplatePage();
  }

  public selectHome() {
    cy.get('mat-icon[svgicon=delivery_white]').click();
    return new HomePage();
  }

  public   assertMaterialsCount(materialsLength: number) {
    cy.get('mat-card').should('have.length', materialsLength + 1);
  }

  public deleteDelivery() {
    cy.get('button').contains('Delete delivery').click();
    return new DeliveryListPage();
  }
}
