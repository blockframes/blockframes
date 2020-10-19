import { WishlistPage, SearchPage } from "./index";
import { AuthLoginPage } from "@blockframes/e2e/pages/auth";
import { TO } from "@blockframes/e2e/utils/env";

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
    cy.get('main', {timeout: TO.PAGE_ELEMENT}).scrollTo('top');
    cy.get('catalog-marketplace a[test-id=heart-icon]', {timeout: TO.PAGE_ELEMENT})
      .click();
    cy.wait(TO.ONE_SEC);
    return new WishlistPage();
  }

  public checkWishListCount(count: number) {
    cy.get('main', {timeout: TO.PAGE_ELEMENT})
      .scrollTo('top');
    cy.get('catalog-marketplace a[test-id=heart-icon]', {timeout: TO.PAGE_ELEMENT})
      .should('contain', count);
  }

  public assertNoWishListCount(count: number) {
    cy.wait(2000);
    cy.get('catalog-marketplace a[test-id=heart-icon]').should('not.contain', count || 0);
  }

  public getWishListCount() {
    let movieCount = 0;
    cy.get('catalog-marketplace a[test-id=heart-icon]', {timeout: TO.PAGE_ELEMENT})
      .then(countEl => {
        movieCount = parseInt(countEl[0].innerText, 10);
        cy.log(`>>Wishes count:${movieCount}`);
        cy.wrap(movieCount).as('movieCount');
      })
  }

  public clickLogout() {
    this.openProfileMenu();
    cy.get('button[test-id=logout]').click();
    return new AuthLoginPage();
  }
}
