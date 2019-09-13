export abstract class NavbarPage {
  constructor() {
      cy.get('[id=navbar]')
  }

  openProfileMenu(){
    cy.get('[id=navbar] button[test-id=profile-avatar]').click();
  }

  clickLogout() {
    cy.get('button[test-id=logout]').click();
  }
}
