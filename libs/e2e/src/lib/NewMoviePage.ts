export class NewMoviePage {
  constructor() {
    // TODO: assert it's the right page
  }

  fillTitle(title: string): any {
    return cy.get('input[formcontrolname="title"]').type(title);
  }

  selectGenre(genre: string): any {
    return cy.get('input[formcontrolname="genres"]').type(genre);
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
        files: []
      }
    };

    cy.fixture(path).then(picture => {
      return Cypress.Blob.base64StringToBlob(picture, 'image/jpeg').then(blob => {
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
    cy.get('form').submit();
  }
}
