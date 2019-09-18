/// <reference types="cypress" />
import {
  LandingPage,
  LoginPage,
  OrganizationHomePage
} from '../support/pages';
import { createUser } from '../support/utils/type';

const USER = createUser();

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth'); // TODO: we should visit the root path instead of /auth
  cy.viewport('macbook-15');
});

describe('story #529 - account creation', () => {
  it('should let me create a user account and send me to the organization creation page', () => {
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();

    p2.switchMode();
    p2.fillSignup(USER);
    const p3: OrganizationHomePage = p2.clickSignup();
    p3.clickLogout();
  });
});
