/// <reference types="cypress" />

export const getTitle = () => cy.get('h1');

export class NewIPPage {
  constructor() {
    // TODO: assert it's the right page
  }

  fillTitle(title: string): any {
    return cy.get('input[formcontrolname="title"]').type(title);
  }

  fillSynopsis(s: string): any {
    return cy.get('textarea[formcontrolname="synopsis"]').type(s);
  }

  selectType(t: string): any {
    cy.get('mat-select[formcontrolname="type"]').click();
    cy.get('mat-option').contains(t).click();
  }

  addGenre(g: string): any {
    return cy.get('input[placeholder="Add a genre"]').type(g + '{downarrow}{enter}');
  }

  setVersion(v: string): any {
    return cy.get('input[formcontrolname="version"]').type(v);
  }

  uploadDocument(p: string): any {
    const type = 'application/pdf';

    return cy.readFile(p, 'base64')
      .then((x) => Cypress.Blob.base64StringToBlob(x, type))
      .then((content) => {
        const testfile = new File([content], 'my-script.pdf', { type });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testfile);

        return cy.get('file-upload section').trigger('drop', { dataTransfer });
      });
  }

  hasUploadStatus(content) {
    return cy.get('file-upload section h3').contains(content)
  }

  save(): any {
    return cy.get('button').contains('Save').click();
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
