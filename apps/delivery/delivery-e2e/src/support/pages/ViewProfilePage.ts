import NavbarPage from "./NavbarPage";
import EditProfilePage from "./EditProfilePage";

export default class ViewProfilePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=profile-display]');
  }

  public clickEdit() {
    cy.get('[page-id=profile-display] button[test-id="edit-profile"]').click();
    return new EditProfilePage();
  }

  public assertEmailExists(email: string) {
    cy.get('div').contains('Email').parent().find('span').contains(email);
  }

  public assertDisplayNameExists(value: string) {
    cy.get(`[page-id=profile-display] mat-card`).find('h4').contains(value);
  }

  public assertDisplaySurnameExists(value: string) {
    cy.get(`[page-id=profile-display] mat-card`).find('span').contains(value);
  }

  public assertDisplayPhoneExists(value: string) {
    cy.get(`[page-id=profile-display] mat-card`).find('span').contains(value);
  }

  public assertDisplayPositionExists(value: string) {
    cy.get(`[page-id=profile-display] mat-card`).find('span').contains(value);
  }

  public assertIdIsAddress() {
    cy.get('label').first().contains('Id');

    cy.get('#mat-input-5', {timeout: 60000}).should(($input) => {
      expect($input.val()).to.match(/0x[a-zA-Z\d]{40}/); // ethereum address regex
    });
  }

  public editPassword() {
    cy.get('[page-id=profile-display] button[test-id="change-password"]').click();
    return new EditProfilePage;
  }
}
