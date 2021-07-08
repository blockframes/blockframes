
export default class ViewPage {

  constructor() {
    cy.get('financiers-movie-view', { timeout: 20000 });
  }

  // public clickWishListButton() {
  //   cy.get('nav [ng-reflect-router-link="avails"]', {timeout: 3000})
  //     .click();
  //   cy.get('financiers-movie-view [test-id=heart-button]', {timeout: 3000})
  //     .click();
  //   cy.wait(5000);
  // }
}

