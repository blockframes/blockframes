import NavbarPage from "./NavbarPage";

export default class OrganizationHomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=join-the-community]', {timeout: 10000});
  }
}
