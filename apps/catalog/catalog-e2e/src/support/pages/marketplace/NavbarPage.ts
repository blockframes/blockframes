import { WishlistPage, SearchPage } from "./index";
import { AuthLoginPage } from "@blockframes/e2e/pages/auth";

export default abstract class NavbarPage {
  constructor() {
    cy.get('catalog-marketplace', {timeout: 10000});
  }

  public openProfileMenu(){
    cy.get('catalog-marketplace button[test-id=profile-avatar]').click();
  }

  public openSideNav(){
    cy.get('catalog-marketplace button[test-id=menu]').click();
  }

  public clickLibrary() {
    cy.get('catalog-marketplace a[test-id=library]').click();
    return new SearchPage();
  }

  public clickWishlist() {
    cy.get('main').scrollTo('top');
    cy.get('catalog-marketplace a[test-id=heart-icon]').click();
    return new WishlistPage();
  }

  public checkWishListCount(count: number) {
    cy.get('main').scrollTo('top');
    cy.get('catalog-marketplace a[test-id=heart-icon]', {timeout: 1000})
      .should('contain', count);
  }

  public assertNoWishListCount(count: number) {
    cy.wait(2000);
    cy.get('catalog-marketplace a[test-id=heart-icon]').should('not.contain', count || 0);
  }

  public clickLogout() {
    this.openProfileMenu();
    cy.get('button[test-id=logout]').click();
    return new AuthLoginPage();
  }
}
