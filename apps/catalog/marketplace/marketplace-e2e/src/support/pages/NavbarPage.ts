import { LoginViewPage, SearchPage, WishlistPage } from './index';

export default abstract class NavbarPage {
  constructor() {
    cy.get('[page-id=navbar]', { timeout: 10000 });
  }

  public openProfileMenu(){
    cy.get('[page-id=navbar]')
      .get('button[test-id=profile-avatar]')
      .click();
  }

  public clickWishlist() {
    cy.get('[page-id=navbar] a[test-id=heartIcon]').click();
    return new WishlistPage();
  }

  public clickLogout() {
    this.openProfileMenu();
    cy.get('button[test-id=logout]').click();
    return new LoginViewPage();
  }

  public clickContextMenuLineUp() {
    cy.get('[page-id=navbar] a')
      .contains('Line-up')
      .click();
    return new SearchPage();
  }
}
