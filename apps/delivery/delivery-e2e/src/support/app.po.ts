export const getGreeting = () => cy.get('h1');
/// <reference types="cypress" />

export const getTitle = () => cy.get('mat-card-title');

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
    //TODO: verify that we are in the correct page
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
    cy.contains('Login');
  }

  public fillEmail(email: string) {
    cy.get('input[type="email"]').type(email);
  }

  public fillPassword(password: string) {
    cy.get('input[type="password"]').type(password);
  }

  public login(): any {
    cy.get('button').contains('Login').click();
    return new HomePage();
  }

}
