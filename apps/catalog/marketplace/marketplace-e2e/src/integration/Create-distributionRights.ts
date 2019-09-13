/// <reference types="cypress" />

import { LandingPage, LoginPage } from '../support/pages';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('auth');
  cy.viewport('ipad-2');
});

describe('test select movie from catalog', () => {
  it('login into an existing account, go to movie catalog, search movie, create distribution rights, add distribution rights', () => {
    // Code all your tests here
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
  });
});
