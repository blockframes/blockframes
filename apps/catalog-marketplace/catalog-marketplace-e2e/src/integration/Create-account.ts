/// <reference types="cypress" />

import { LoginPage } from "../support/pages";
import { User, createRandomUser } from "../support/utils/types"
import LandingPage from "../support/pages/LandingPage";
import NavbarPage from "../support/pages/NavBarPage";
import OrganizationHomePage from "../support/pages/OrganizationHomePage";


beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

const createUser: User = createRandomUser();

describe('create account and logout', () => {
  it('should fill a user form, signup, and then logout', () => {
    const p1: LandingPage = new LandingPage;
    const p2: LoginPage = p1.clickAccess();
    p2.goToSignUp();
    p2.fillSignUpForm(createUser);
    const p3: OrganizationHomePage = p2.submitSignUp();
    p3.openProfileMenu();
    p3.clickLogout();
  });
});
