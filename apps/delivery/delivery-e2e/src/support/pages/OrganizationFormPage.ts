import NavbarPage from "./NavbarPage";

export default class OrganizationFormPage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=organization-editable]', {timeout: 10000})
  }

  public clickEditButtion() {
    cy.get('[page-id=organization-editable] [page-id=organization-display] button').click();
  }

  public fillAddressAndPhoneNumber(address: string, phoneNumber: string) {
    cy.get('[page-id=organization-form] input[type=text]').clear().type(address);
    cy.get('[page-id=organization-form] input[type=tel]').clear().type(phoneNumber);
  }

  public assertAddressAndPhoneNumber(address: string, phoneNumber: string) {
    cy.get('[page-id=organization-display] mat-card').contains(address);
    cy.get('[page-id=organization-display] mat-card').contains(phoneNumber);
  }

  public clickSaveButton() {
    cy.get('[page-id=organization-editable] button[test-id=save]').click();
  }
}
