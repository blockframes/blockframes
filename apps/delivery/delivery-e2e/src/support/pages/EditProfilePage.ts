import ViewProfilePage from "./ViewProfilePage";

export default class EditProfilePage {
  constructor() {
    cy.get('[page-id=profile-editable]');
  }

  public fillName(value: string) {
    cy.get(`[page-id=profile-edit] input[test-id="name-form"]`).clear().type(value);
  }

  public fillSurname(value: string) {
    cy.get(`[page-id=profile-edit] input[test-id="surname-form"]`).clear().type(value);
  }

  public fillPhoneNumber(value: string) {
    cy.get(`[page-id=profile-edit] input[test-id="phone-form"]`).clear().type(value);
  }

  public fillPosition(value: string) {
    cy.get(`[page-id=profile-edit] input[test-id="position-form"]`).clear().type(value);
  }

  public assertEmailExists(value: string) {
    cy.get(`input[formControlName=email]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertNameExists(value: string) {
    cy.get(`[page-id=profile-edit] input[test-id="name-form"]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertSurnameExists(value: string) {
    cy.get(`[page-id=profile-edit] input[test-id="surname-form"]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertPhoneExists(value: string) {
    cy.get(`[page-id=profile-edit] input[test-id="phone-form"]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertPositionExists(value: string) {
    cy.get(`[page-id=profile-edit] input[test-id="position-form"]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public currentPassword(value: string) {
    cy.get(`[page-id=password-edit] input[test-id="current-password"]`).clear().type(value);
  }

  public newPassword(value: string) {
    cy.get(`[page-id=password-edit] input[test-id="password"]`).clear().type(value);
  }

  public confirmPassword(value: string) {
    cy.get(`[page-id=password-edit] input[test-id="password-confirm"]`).clear().type(value);
  }

  public clickSave() {
    cy.get(`[page-id=profile-editable]`).find(`button[test-id=save]`).click();
  }

  public clickClose() {
    cy.get(`[page-id=profile-editable]`).find('button[test-id=close]').click();
    return new ViewProfilePage();
  }
}
