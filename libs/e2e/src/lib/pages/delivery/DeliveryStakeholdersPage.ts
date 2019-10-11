export default class DeliveryStakeholdersPage {
  constructor() {
    cy.get('delivery-stakeholders-editable', { timeout: 10000 });
  }

  public inviteOrganization(organizationName: string) {
    this.fillSearchInput(organizationName);
    this.clickStakeholder(organizationName);
  }

  public fillSearchInput(organizationName: string) {
    cy.get('delivery-stakeholders-editable input[type=text]').type(organizationName);
  }

  public clickStakeholder(organizationName: string) {
    cy.get('mat-option[test-id=option]').contains(organizationName).click();
  }

  public assertOrganizationIsInvited(organizationName: string) {
    cy.get('delivery-stakeholders-editable tr', { timeout: 5000 })
      .contains('tr', organizationName)
      .should(tr => expect(tr).to.contain(organizationName));
  }
}
