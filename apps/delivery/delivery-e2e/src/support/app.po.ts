export const getGreeting = () => cy.get('h1');
/// <reference types="cypress" />

export const getTitle = () => cy.get('section h1');

export class NewTemplatePage {
  constructor() {
    cy.contains('Save as a new template');
  }

  public clickSelect() {
    cy.get('mat-select').click();
  }

  public pickOrganization(orgName: string) {
    cy.get('mat-option').contains(orgName).click();
  }

  public fillName(templateName: string) {
    cy.get('input').type(templateName);
  }

  public clickSave() {
    cy.get('button').contains('Save Template').click();
    return new DeliveryFormPage();
  }
}

export class DeliveryFormPage {
  constructor() {
    cy.get('.delivery-form').should('contain', 'Sign delivery');
  }

  public clickAdd() {
    cy.get('button.add-material-button').click();
  }

  public clickAddCategory() {
    cy.get('button').contains('Add new material with this category').first().click();
  }

  public fillValue(materialValue: string) {
    cy.get('input.value').type(materialValue);
  }

  public fillDescription(materialDescription: string) {
    cy.get('input.description').type(materialDescription);
  }

  public fillCategory(materialCategory: string) {
    cy.get('input.category').type(materialCategory);
  }

  public clickAddMaterial() {
    cy.get('button.save-material').click();
  }

  public clickSaveAsTemplate() {
    cy.get('button').contains('Save as new template').click();
    return new NewTemplatePage();
  }

  public selectDeliveries() {
    cy.get('.mat-tab-links').get('a').contains('deliveries').click();
    return new DeliveryListPage();
  }

  public assertMaterialsExist(materialsLength: number) {
    cy.get('mat-card mat-card').should('have.length', materialsLength);
  }

  public deleteDelivery() {
    cy.get('button').contains('Delete delivery').click();
    return new DeliveryListPage();
  }
}

export class TemplatePickerPage{
  constructor() {
    cy.contains('Create delivery from scratch');
  }

  public clickCreateNewDelivery() {
    cy.get('section.container').should('contain', 'Template #1');
    cy.get('mat-card.create-card', {timeout: 500}).click();
    return new DeliveryFormPage();
  }

  public clickTemplateDelivery(templateName: string) {
    cy.get('.ng-star-inserted > .mat-card > .mat-card-title').contains(templateName).click();
  }
}

export class DeliveryListPage {
  constructor() {
    cy.contains('deliveries');
  }

  public clickAddDelivery() {
    cy.get('button.add-delivery').click();
    return new TemplatePickerPage();
  }

  public assertDeliveryExists() {
    cy.get('.delivery-card').should('have.length', 1);
  }

  public clickDelivery() {
    cy.get('.delivery-card').first().click();
    return new DeliveryFormPage();
  }

  public assertDeliveryIsDeleted() {
    cy.get('.delivery-card').should('have.length', 0);
  }

  public selectTemplate() {
    cy.get('.mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}

export class AddTemplateModal {
  constructor() {
    //TODO: verify that we are in the correct page
  }

  public fillTemplateName(name: string) {
    cy.get('input[placeholder="New template name"]').type(name);
  }

  public clickCreate() {
    cy.get('button').contains('Create').click();
// tslint:disable-next-line: no-use-before-declare
    return new TemplateListPage();
  }
}

export class TemplateListPage {
  constructor() {
    cy.contains('templates');
  }

  public createTemplate() {
    cy.get('button').contains('Add Template').click();
    return new AddTemplateModal();
  }

  public assertTemplateExists(templateName: string) {
    cy.get('mat-card-title').contains(templateName).should('have.length', 1);
  }

  public clickMenu(templateName: string) {
    cy.get('mat-card').find('button.trigger').contains(templateName).click();
  }

  public openAccordeon(orgName: string) {
    cy.get('mat-panel-title').contains(orgName).click();
  }
}

export class HomePage {
  constructor() {
    //TODO: verify that we are in the correct page
  }

  public displayMovieMenu() {
    cy.get('button mat-icon').should('contain', 'more_vert').contains('more_vert').click();
  }

  public clickOpenIn() {
    cy.get('button span').should('contain', 'Open in...').contains('Open in...').click();
  }

  public selectApp() {
    cy.get('button').should('contain', 'Current app').contains('Current app').click();
    return new DeliveryListPage();
  }

  public selectTemplate() {
    cy.get('.mat-tab-links').get('a').contains('template').click();
    return new TemplateListPage();
  }
}

export class LandingPage {
  constructor() {
    cy.contains('Sign in');
  }

  public fillEmail(email: string) {
    cy.get('#signin input[type="email"]').type(email);
  }

  public fillPassword(password: string) {
    cy.get('#signin input[type="password"]').type(password);
  }

  public login(): any {
    cy.get('button').contains('Signin').click();
    return new HomePage();
  }

}
