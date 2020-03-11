import { WishlistPage, SearchPage } from "./index";
import { LoginViewPage } from "../auth";

export default abstract class NavbarPage {
  constructor() {
    cy.get('catalog-layout');
  }

  public openProfileMenu(){
    cy.get('catalog-layout button[test-id=profile-avatar]').click();
  }

  public openSideNav(){
    cy.get('catalog-layout button[test-id=menu]').click();
  }

  public clickLibrary(){
    cy.get('catalog-layout a[test-id=library]').click();
    return new SearchPage();
  }

  public clickWishlist() {
    cy.get('catalog-layout a[test-id=heart-icon]').click();
    return new WishlistPage();
  }

  public checkWishListCount(count: number) {
    cy.get('catalog-layout a[test-id=heart-icon]').should('contain', count);
  }

  public clickLogout() {
    this.openProfileMenu();
    cy.get('button[test-id=logout]').click();
    return new LoginViewPage();
  }
}
