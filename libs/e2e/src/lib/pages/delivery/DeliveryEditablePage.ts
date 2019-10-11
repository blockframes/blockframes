import NavbarPage from '../NavbarPage';
import ConfirmModal from '../ConfirmModal';
import SaveAsTemplateModal from './SaveAsTemplateModal';
import { Material } from '../../utils/type';
import { getCurrencySymbol } from '../../utils/functions';

export default class DeliveryEditablePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=delivery-editable]', { timeout: 20000 });
  }

  public assertDeliveryMustBeSigned() {
    cy.get('[page-id=delivery-editable] [test-id=sign-icon]');
  }

  public assertTableDisplayPrice() {
    cy.get('[page-id=delivery-editable] th[test-id=material-price]');
  }

  public clickDeleteDelivery(): ConfirmModal {
    cy.get('[page-id=delivery-editable] mat-icon[svgIcon=delete]').click();
    return new ConfirmModal();
  }

  public clickSaveAsTemplate() {
    cy.get('[page-id=delivery-editable] [test-id=save-as-template]').click();
    return new SaveAsTemplateModal();
  }

  ////////////////////////
  // DELIVERY MATERIALS //
  ////////////////////////

  //-------------------------------------
  //               CLICK
  //-------------------------------------

  public addMaterial() {
    // open the sidenav
    cy.get('[page-id=delivery-editable] button[test-id=add]').click();
  }

  public saveMaterial() {
    cy.get('[page-id=delivery-editable] button[test-id=save]').click();
  }

  public editMaterial(material: Material) {
    cy.get('[page-id=delivery-material-list] tr')
      .contains('tr', material.title)
      .find('button')
      .click();
  }

  public deleteMaterial(): ConfirmModal {
    cy.get('[page-id=delivery-material-form] button[test-id=delete]').click();
    return new ConfirmModal();
  }

  public selectMaterial(material: Material) {
    cy.get('[page-id=delivery-material-list] tr')
      .contains('tr', material.title)
      .find('mat-checkbox')
      .click();
  }

  public selectAllMaterials() {
    cy.get('[page-id=delivery-material-list] th')
      .find('mat-checkbox')
      .click();
  }

  public updateStatus(status: string) {
    this.openActionsMenu();
    this.selectAction(status);
  }

  public openActionsMenu() {
    cy.get('[page-id=delivery-editable] [test-id=actions]').click();
  }

  public selectAction(status: string) {
    cy.get('button')
      .contains(status)
      .click();
  }

  //-------------------------------------
  //              FILL/CLEAR
  //-------------------------------------

  public fillMaterial(material: Material) {
    this.fillTitle(material.title);
    this.fillDescription(material.description);
    this.selectStep(material.step.name);
    this.fillCategory(material.category);
    this.fillPrice(material.price);
    this.selectCurrency(material.currency);
  }

  public fillTitle(title: string) {
    cy.get('[page-id=delivery-material-form] input[formControlName=value]').type(title);
  }

  public fillDescription(description: string) {
    cy.get('[page-id=delivery-material-form] textarea[formControlName=description]').type(
      description
    );
  }

  public selectStep(stepName: string) {
    cy.get('[page-id=delivery-material-form] mat-select[formControlName=stepId]').click();
    cy.get('mat-option')
      .contains(stepName)
      .click();
  }

  public fillCategory(category: string) {
    cy.get('[page-id=delivery-material-form] input[formControlName=category]').type(category);
  }

  public fillPrice(price: string) {
    cy.get('[page-id=delivery-material-form] input[formControlName=price]').type(price);
  }

  public selectCurrency(currency: string) {
    cy.get('[page-id=delivery-material-form] mat-select[formControlName=currency]').click();
    cy.get('mat-option')
      .contains(currency)
      .click();
  }

  public clearMaterial() {
    this.clearTitle();
    this.clearDescription();
    this.clearCategory();
    this.clearPrice();
  }

  public clearTitle() {
    cy.get('[page-id=delivery-material-form] input[formControlName=value]').clear();
  }

  public clearDescription() {
    cy.get('[page-id=delivery-material-form] textarea[formControlName=description]').clear();
  }

  public clearCategory() {
    cy.get('[page-id=delivery-material-form] input[formControlName=category]').clear();
  }

  public clearPrice() {
    cy.get('[page-id=delivery-material-form] input[formControlName=price]').clear();
  }

  public clearSelectAllCheckbox() {
    cy.get('[page-id=delivery-material-list] th')
      .find('mat-checkbox')
      .uncheck();
  }

  //-------------------------------------
  //               ASSERT
  //-------------------------------------

  public assertMaterialExists(material: Material) {
    cy.get('[page-id=delivery-editable] tr').should(tr =>
      expect(tr)
        .to.contain(material.title)
        .to.contain(material.category)
        .to.contain(material.step.name)
        .to.contain(material.description)
        .to.contain(getCurrencySymbol(material.currency))
    );
  }

  public assertNoMaterialsExists() {
    cy.get('[page-id=delivery-material-list] tr').should(tr => expect(tr).length(1));
  }

  public assertMaterialsArePaid(materials: Material[]) {
    materials.forEach(material =>
      cy
        .get('[page-id=delivery-material-list] tr')
        .contains(material.title)
        .should(tr => expect('mat-icon[test-id=paid]').to.exist)
    );
  }

  public assertMaterialsAreOrdered(materials: Material[]) {
    materials.forEach(material =>
      cy
        .get('[page-id=delivery-material-list] tr')
        .contains(material.title)
        .should(tr => expect('mat-icon[test-id=ordered]').to.exist)
    );
  }

  public assertMaterialStatusChanged(materials: Material[], status: string) {
    materials.forEach(material =>
      cy
        .get('[page-id=delivery-material-list] tr')
        .should('contain', material.title)
        .should(tr => expect(tr).to.contain(status))
    );
  }
}
