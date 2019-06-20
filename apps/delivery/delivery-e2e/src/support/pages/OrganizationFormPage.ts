import NavbarPage from "./NavbarPage";
import HomePage from "./HomePage";

export default class OrganizationFormPage extends NavbarPage {
  constructor() {
    super();
  }

  public clickAdd() {
    cy.get('button[testId=addMember]').click();
  }

  public selectRole(role: string) {
    cy.get('input[formcontrolname=role]').click();
    cy.get('mat-option').contains(role).click();
  }

  public assertEmailValidated(email: string) {
    cy.get('input[formControlName=user]').should(input => {
      expect(input.val()).to.contain(email);
    })
  }

  public fillAndSelectEmail(partialEmail: string, email: string) {
    cy.get('input[formcontrolname=user]').type(partialEmail);
    cy.wait(2000);
    cy.get('input[formcontrolname=user]').click();
    cy.get('mat-option').contains(email).click();
  }

  public assertOrgNameExists(orgName: string) {
    cy.wait(2000);
    cy.get('mat-card-title').contains(orgName);
  }

  public fillOrgName(orgName: string) {
    cy.get('input[formcontrolname=name]').type(orgName);
  }

  public fillOrgAddress(orgAddress: string) {
    cy.get('textarea[formcontrolname=address]').type(orgAddress);
  }

  public clickNext() {
    cy.get('button.mat-primary').click();
    return new HomePage();
  }
}
