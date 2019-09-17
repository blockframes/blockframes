import HomePage from './HomePage';

export default abstract class NavbarPage {
  constructor() {
    cy.get('[page-id=navbar]', { timeout: 10000 });
  }

  public openProfileMenu(){
    cy.get('[page-id=navbar] button[test-id=profile-avatar]').click();
  }

  public clickLogout() {
    cy.get('button[test-id=logout]').click();
  }
}
