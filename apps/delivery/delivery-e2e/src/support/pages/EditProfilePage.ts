import ViewProfilePage from "./ViewProfilePage";

export default class EditProfilePage {
  constructor() {
    cy.get('[page-id=profile-editable]');
  }

  public fillName(value: string) {
    cy.get(`[page-id=profileEdit] input[test-id="name-form"]`).clear().type(value);
  }

  public fillSurname(value: string) {
    cy.get(`[page-id=profileEdit] input[test-id="surname-form"]`).clear().type(value);
  }

  public fillPhoneNumber(value: string) {
    cy.get(`[page-id=profileEdit] input[test-id="phone-form"]`).clear().type(value);
  }

  public fillPosition(value: string) {
    cy.get(`[page-id=profileEdit] input[test-id="position-form"]`).clear().type(value);
  }

  public assertEmailExists(value: string) {
    cy.get(`input[formControlName=email]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertFirstNameExists(value: string) {
    cy.get(`input[formControlName=first_name]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertLastNameExists(value: string) {
    cy.get(`input[formControlName=last_name]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public currentPassword(value: string) {
    cy.get(`[page-id=passwordEdit] input[test-id="currentPassword"]`).clear().type(value);
  }

  public newPassword(value: string) {
    cy.get(`[page-id=passwordEdit] input[test-id="password"]`).clear().type(value);
  }

  public confirmPassword(value: string) {
    cy.get(`[page-id=passwordEdit] input[test-id="password-confirm"]`).clear().type(value);
  }

  public clickSave() {
    cy.get(`[page-id=profile-editable] [test-id=action-button]`).find(`button[test-id=save]`).click();
  }

  public clickClose() {
    cy.get(`[page-id=profile-editable] [test-id=action-button]`).find('button[test-id=close]').click();
    return new ViewProfilePage();
  }
}
