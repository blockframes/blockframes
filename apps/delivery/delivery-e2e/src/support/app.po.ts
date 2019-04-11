export const getGreeting = () => cy.get('h1');
/// <reference types="cypress" />

export const getTitle = () => cy.get('section h1');

export class DeliveryFormPage {
  constructor() {
    //cy.contains('Sign delivery');
  }

  public clickAdd() {
    cy.get('mat.icon.icon-add').click();
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
    cy.get('span.mat-icon').click();
  }
}

export class TemplatePickerPage{
  constructor() {
    cy.contains('Cancel');
  }

  public clickCreateNewDelivery() {
    cy.get('mat-card.create-card').click();
    return new DeliveryFormPage();
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

  public assertTemplateExists(name: string) {
    cy.get('template-item').contains(name).should('have.length', 1);
  }

  public clickMenu(name: string) {
    cy.get('mat-card').should('contain', name).contains(name).get('mat-icon').contains('more_vert')
    .click();
  }
}

export class HomePage {
  constructor() {
    //TODO: verify that we are in the correct page
  }

  public displayUserMenu() {
    cy.get('mat-icon').contains('account_circle').click();
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

  public selectOrganization(name: string) {
    cy.get('button').should('contain', name).contains(name).click();
  }

  public selectTemplate() {
    cy.get('.top-toolbar-context-menu').get('a').contains('Template').click();
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
