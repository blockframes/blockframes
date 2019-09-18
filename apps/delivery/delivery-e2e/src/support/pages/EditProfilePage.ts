import NavbarPage from "./NavbarPage";

export default class EditProfilePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=profile-editable]', {timeout: 10000});
  }

  //////////////////
  // PROFILE FORM //
  //////////////////

  public fillName(value: string) {
    cy.get(`[page-id=profile-form] input[test-id="name-form"]`).clear().type(value);
  }

  public fillSurname(value: string) {
    cy.get(`[page-id=profile-form] input[test-id="surname-form"]`).clear().type(value);
  }

  public fillPhoneNumber(value: string) {
    cy.get(`[page-id=profile-form] input[test-id="phone-form"]`).clear().type(value);
  }

  public fillPosition(value: string) {
    cy.get(`[page-id=profile-form] input[test-id="position-form"]`).clear().type(value);
  }

  public assertEmailExists(value: string) {
    cy.get(`[page-id=profile-form] input[formControlName=email]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertNameExists(value: string) {
    cy.get(`[page-id=profile-form] input[test-id="name-form"]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertSurnameExists(value: string) {
    cy.get(`[page-id=profile-form] input[test-id="surname-form"]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertPhoneExists(value: string) {
    cy.get(`[page-id=profile-form] input[test-id="phone-form"]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertPositionExists(value: string) {
    cy.get(`[page-id=profile-form] input[test-id="position-form"]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  ///////////////////
  // PASSWORD FORM //
  //////////////////

  public currentPassword(value: string) {
    cy.get(`[page-id=password-edit] input[test-id="current-password"]`).clear().type(value);
  }

  public newPassword(value: string) {
    cy.get(`[page-id=password-edit] input[test-id="password"]`).clear().type(value);
  }

  public confirmPassword(value: string) {
    cy.get(`[page-id=password-edit] input[test-id="password-confirm"]`).clear().type(value);
  }

  /////////////////
  // SHARED FORM //
  /////////////////

  public clickSave() {
    cy.get(`[page-id=profile-editable]`).find(`button[test-id=save]`).click();
  }

  public clickClose() {
    cy.get(`[page-id=profile-editable]`).find('button[test-id=close]').click();
  }

  /////////////////////
  // PROFILE DISPLAY //
  /////////////////////

  public clickEdit() {
    cy.get('[page-id=profile-display] button[test-id="edit-profile"]').click();
    cy.get('[page-id=profile-form]', {timeout: 2000});
  }

  public assertDisplayEmailExists(email: string) {
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
    cy.get('[page-id=password-edit]', {timeout: 2000});
  }
}
