/// <reference types="cypress" />

export const getGreeting = () => cy.get('h1');

export class NewMoviePage {
  constructor() {
    // TODO: assert it's the right page
  }

  fillTitle(title: string): any {
    return cy.get('input[formcontrolname="title"]').type(title);
  }

  fillProductionCompany(productionCompany: string): any {
    return cy.get('input[formcontrolname="productionCompany"]').type(productionCompany);
  }

  fillInternationalSalesCompany(internationaSalesCompany: string): any {
    return cy.get('input[formcontrolname="internationaSalesCompany"]').type(internationaSalesCompany);
  }

  fillDirector(director: string): any {
    return cy.get('input[formcontrolname="director"]').type(director);
  }

  fillWriter(writer: string): any {
    return cy.get('input[formcontrolname="writer"]').type(writer);
  }

  fillCast(cast: string): any {
    return cy.get('input[formcontrolname="cast"]').type(cast);
  }

  selectGenre(genre: string): any {
    return cy.get('input[formcontrolname="genre"]').type(genre);
  }

  selectStatus(status: string): any {
    return cy.get('input[formcontrolname="status"]').type(status);
  }

  fillLogline(logline: string): any {
    return cy.get('input[formcontrolname="logline"]').type(logline);
  }

  fillBudget(budget: string): any {
    return cy.get('input[formcontrolname="budget"]').type(budget);
  }

  uploadImage(path: string): any {
    const dropEvent = {
      dataTransfer: {
          files: [
          ],
      },
    };

  cy.fixture(path).then((picture) => {
    return Cypress.Blob.base64StringToBlob(picture, 'image/jpeg').then((blob) => {
      dropEvent.dataTransfer.files.push(blob);
    });
  });

  cy.get('Dropzone').trigger('drop', dropEvent);
  }

  fillAsk(ask: string): any {
    return cy.get('input[formcontrolname="ask"]').type(ask);
  }

  fillMinimumInvestment(minimumInvestment: string): any {
    return cy.get('input[formcontrolname="minimumInvestment"]').type(minimumInvestment);
  }

  submitForm() {
    cy.get('form').submit() ;
  }
}

export class HomePage {
  constructor() {
    // TODO: assert it's the right page
  }

  clickNewMovie(): any {
    cy.get('mat-toolbar')
      .contains('New Movie')
      .click({force: true});
    return new NewMoviePage();
  }

  findMovieItemByTitle(title: string) {
    cy.contains(title);
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
