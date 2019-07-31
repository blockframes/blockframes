/// <reference types="cypress" />

import LoginPage from '../support/pages/LoginPage';
import HomePage from '../support/pages/HomePage';
import CatalogHomePage from '../support/pages/CatalogHomePage';

beforeEach(() => {
  indexedDB.deleteDatabase('firebaseLocalStorageDb');
  cy.visit('/');
  cy.viewport('macbook-15');
});

describe('I\'m a new user, I signup and navigate to the catalog homepage through the URL', () => {
  it('should signin and navigate to the catalog homepage', () => {
    const email = 'max@gmx.de';
    const password = '123123'
    const loginPage = new LoginPage();
    loginPage.fillSignin(email, password);
    const homePage: HomePage = loginPage.clickSignin();
    cy.wait(200);
    homePage.assertMovieNotExists('Pulp Fiction');
    cy.visit('/layout/o/catalog').contains('[testId=catalog-homepage]');
    const catalogHomePage = new CatalogHomePage();
    catalogHomePage.clickOnHeaderButton();
  });
});
