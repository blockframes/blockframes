/// <reference types="cypress" />

import { WelcomeViewPage, LoginViewPage, OrganizationHomePage, NavbarPage } from '../support/pages';
import { User } from '../support/utils/type';

const USER: User = {
  email: 'cypress@blockframes.com',
  password: 'blockframes',
  name: 'cypress',
  surname: 'cypress'
}

// TEST

beforeEach(()=> {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth')
  cy.viewport('ipad-2', 'landscape');
  const p1: WelcomeViewPage = new WelcomeViewPage();
  const p2: LoginViewPage = p1.clickCallToAction();
  const p3: OrganizationHomePage = new OrganizationHomePage();
})


describe('User create new account', () => {
  it('fill all the fields appropriately', () => {
    const p1 = new LoginViewPage();
    p1.fillSignup(USER);
    p1.clickTermsAndCondition();
    p1.clickSignup();
  });
});
