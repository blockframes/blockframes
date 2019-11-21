import { WishlistPage, SearchPage } from "./index";

export default abstract class NavbarPage {
  constructor() {
    cy.get('[page-id=navbar]', { timeout: 10000 });
  }

  public openProfileMenu(){
    cy.get('[page-id=navbar] button[test-id=profile-avatar]').click();
  }

  public clickWishlist() {
    cy.get('[page-id=navbar] a[test-id=heartIcon]').click();
    return new WishlistPage();
  }

  public clickLogout() {
    cy.get('button[test-id=logout]').click();
  }

  public clickContextMenuLineUp() {
    cy.get('[page-id=navbar] a')
      .contains('Line-up')
      .click();
    return new SearchPage();
  }
}
