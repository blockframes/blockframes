import NavbarPage from "../NavbarPage";

export default class OrganizationHomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=organization-home]', {timeout: 10000});
  }
}
