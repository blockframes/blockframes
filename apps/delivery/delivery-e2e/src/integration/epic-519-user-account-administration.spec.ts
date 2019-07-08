/// <reference types="cypress" />
import {
  EditProfilePage,
  HomePage,
  LandingPage,
  LoginPage,
  OrganizationFormPage,
  ViewProfilePage
} from '../support/pages';

function randomEmail(): string {
  return `cypress${Math.floor(Math.random() * 10000) + 1}@blockframes.com`;
}

const randomPassword = (): string => `${new Date().toISOString()}`;

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth'); // TODO: we should visit the root path instead of /auth
  cy.viewport('macbook-15');
});

describe('story #529 - account creation', () => {
  it('should let me create a user account and send me to the organization creation page', () => {
    const email = randomEmail();
    const password = randomPassword();

    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();

    p2.switchMode();
    p2.fillSignup({ email, password, passwordConfirm: password });
    const p3: HomePage = p2.clickSignup();
  });
});
