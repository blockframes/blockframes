import ViewProfilePage from "./ViewProfilePage";

export default class EditProfilePage {
  constructor() {
    cy.get('[testId=profileEdit]');
  }

  public fillFirstName(value: string) {
    cy.get(`input[formControlName=first_name]`).type(value);
  }

  public fillLastName(value: string) {
    cy.get(`input[formControlName=last_name]`).type(value);
  }

  public fillBiography(value: string) {
    cy.get(`textarea[formControlName=biography]`).type(value);
    cy.wait(200);
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

  public clickArrowBack() {
    cy.get('[testId=profileEdit]').find('button.mat-primary').contains('arrow_back').click();
    return new ViewProfilePage();
  }

  public assertBiographyExists(value: string) {
    cy.get(`textarea[formControlName=biography]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public clickSave() {
    cy.get('[testId=profileEdit]').find('button.mat-primary').contains('Save').click();
  }
}
