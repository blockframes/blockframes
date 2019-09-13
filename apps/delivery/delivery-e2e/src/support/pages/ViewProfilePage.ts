import NavbarPage from "./NavbarPage";
import EditProfilePage from "./EditProfilePage";

export default class ViewProfilePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=profileView]');
  }

  public clickEdit() {
    cy.get('button').contains('edit').click();
    return new EditProfilePage();
  }

  public assertEmailExists(email: string) {
    cy.get('div').contains('Email').parent().find('span').contains(email);
  }

  public assertFirstNameExists(value: string) {
    cy.get('div').contains('First Name').parent().find('span').contains(value);
  }

  public assertLastNameExists(value: string) {
    cy.get('div').contains('Last Name').parent().find('span').contains(value);
  }

  public assertBiographyExists(value: string) {
    cy.get('div').contains('Biography').parent().find('p').contains(value);
  }

  public assertIdIsAddress() {
    cy.get('label').first().contains('Id');

    cy.get('#mat-input-5', {timeout: 60000}).should(($input) => {
      expect($input.val()).to.match(/0x[a-zA-Z\d]{40}/); // ethereum address regex
    });
  }
}
