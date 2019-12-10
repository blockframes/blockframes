import { WishlistPage, SearchPage, LoginViewPage, HomePage } from "./index";

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

  public checkWishListCount(count: number) {
    cy.get('[page-id=navbar] a[test-id=heartIcon]').should('contain', count);
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

  public clickContextMenuHome() {
    cy.get('[page-id=navbar] a')
      .contains('home')
      .click();
    return new HomePage();
  }
}
