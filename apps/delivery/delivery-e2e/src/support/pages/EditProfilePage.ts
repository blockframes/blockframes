import ViewProfilePage from "./ViewProfilePage";

export default class EditProfilePage {
  constructor() {
    cy.get('[page-id=profileEdit]');
  }

  public fillName(value: string) {
    cy.get(`input[formControlName="name"]`).type(value);
  }

  public fillSurname(value: string) {
    cy.get(`input[formControlName="surname"]`).type(value);
  }

  public fillPhoneNumber(value: string) {
    cy.get(`input[formControlName="phoneNumber"]`).type(value);
  }

  public fillPosition(value: string) {
    cy.get(`input[formControlName="position"]`).type(value);
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

  public clickSave() {
    cy.get(`[test-id=action-button]`).find('button').contains('svgIcon="save"').click();
  }

  public clickClose() {
    cy.get(`[test-id=action-button]`).find('button').contains('cross').click();
    return new ViewProfilePage();
  }
}
