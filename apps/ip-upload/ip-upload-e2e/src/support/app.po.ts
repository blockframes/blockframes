/// <reference types="cypress" />

export const getTitle = () => cy.get('h1');

export class NewIPPage {
  constructor() {
    // TODO: assert it's the right page
  }

  fillTitle(title: string): any {
    return cy.get('input[formcontrolname="title"]').type(title);
  }

  saveStatus() {
    return cy.get('button').contains('Save');
  }
}

export class HomePage {
  constructor() {
    // TODO: assert it's the right page
  }

  clickNewIp(): any {
    cy.get('mat-toolbar')
      .contains('New Ip')
      .click();
    return new NewIPPage();
  }

}

export class LandingWithModal {
  constructor() {
    cy.contains('Login');
  }

  public fillEmail(email: string) {
    cy.get('input[type="email"]').type(email).then(() => this);
  }

  public fillPassword(password: string) {
    cy.get('input[type="password"]').type(password).then(() => this);
  }

  public login(): any {
    cy.get('button').contains('Login').click();
    return new HomePage();
  }
}

export class Landing {
  public clickConnection(): any {
    cy.contains('Connexion').click();
    return new LandingWithModal();
  }
}
