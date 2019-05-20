/// <reference types="cypress" />

import { LandingPage, HomePage, OrganizationFormPage } from "../support/app.po";

let currentID = 0;

const randomID = (): string => `${new Date().toISOString()}-${currentID++}`;

function generateRandomEmail(): string {
  return `cypress${Math.floor(Math.random() * 10000) + 1}@test.com`;
}

const EMAIL_CYTEST = 'hello@logicalpictures.com';
const PARTIAL_EMAIL_CYTEST = 'hello@lo';
const ROLE_CYTEST = 'READ';

const ORG_USER = 'user org';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Test CRUD org', () => {
  it('should create an account, create an organization, add member to organization, then logout', () => {
    // Create new account
    const p1: LandingPage = new LandingPage();
    const EMAIL_USER = generateRandomEmail();
    const PASSWORD_USER = randomID();
    p1.fillSignupEmail(EMAIL_USER);
    p1.fillSignupPassword(PASSWORD_USER);
    const p2: HomePage = p1.signup();
    p2.assertEncryptingExists();

    // TODO: verify account and wallet

    // Create an organization
    const p3: OrganizationFormPage = p2.clickCreateAnOrganization();
    p3.fillOrgName(ORG_USER);
    p3.fillOrgAddress(ORG_USER);
    const p4: HomePage = p3.clickNext();
    p4.assertOrgExists(ORG_USER);

    // Add a member to this organization
    p4.openUserMenu();
    const p5: OrganizationFormPage = p4.clickOnOrganization(ORG_USER);
    p5.assertOrgNameExists(EMAIL_USER);
    p5.fillAndSelectEmail(PARTIAL_EMAIL_CYTEST, EMAIL_CYTEST);
    p5.assertEmailValidated(EMAIL_CYTEST);
    p5.selectRole(ROLE_CYTEST);
    p5.clickAdd();
    p5.assertOrgNameExists(EMAIL_CYTEST);
    // TODO: delete this member (the function is not implemented yet)

    const p6: HomePage = p5.clickHome();
    p6.assertOrgExists(ORG_USER);
    p6.openUserMenu();
    const p8: LandingPage = p6.clickLogout();
  });
});
