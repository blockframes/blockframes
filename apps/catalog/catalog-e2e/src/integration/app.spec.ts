/// <reference types="cypress" />

import LoginPage from '../support/pages/LoginPage';
import CatalogHomePage from '../support/pages/CatalogHomePage';

beforeEach(() => {
  indexedDB.deleteDatabase('firebaseLocalStorageDb');
  cy.visit('/');
  cy.viewport('macbook-15');
});

const email = 'max@gmx.de'
const password = '123123';

describe("I'm a existing user, I signin and navigate to the catalog homepage", () => {
  it('should signin and navigate to the catalog homepage', () => {
    const loginPage = new LoginPage();
    loginPage.fillSignin(email, password);
    loginPage.clickSignin();
    cy.wait(1000);
    const catalogHomePage = new CatalogHomePage();
    catalogHomePage.clickOnBestSellers();
  });
});
