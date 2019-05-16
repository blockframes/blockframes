/// <reference types="cypress" />

export class EditProfilePage {
  constructor() {
    cy.get('mat-card-header').contains('Edit account');
  }

  public wait(time: number) {
    cy.wait(time);
  }

  public assertIdIsAddress() {
    cy.get('label').first().contains('Id');

    cy.get('#mat-input-5', {timeout: 60000}).should(($input) => {
      expect($input.val()).to.match(/0x[a-zA-Z\d]{40}/); // ethereum address regex
    });
  }
}
