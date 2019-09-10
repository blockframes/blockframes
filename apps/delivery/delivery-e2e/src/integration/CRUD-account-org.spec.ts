/// <reference types="cypress" />

import { EditProfilePage, HomePage, LandingPage, OrganizationFormPage, ViewProfilePage } from '../support/pages';

let currentID = 0;

const randomID = (): string => `${new Date().toISOString()}-${currentID++}`;

function generateRandomEmail(): string {
  return `cypress${Math.floor(Math.random() * 10000) + 1}@blockframes.com`;
}

const EMAIL_CYTEST = 'hello@logicalpictures.com';
const PARTIAL_EMAIL_CYTEST = 'hello@lo';
const ROLE_CYTEST = 'READ';

const ORG_USER = 'user org';
const FIRST_NAME_USER = 'Pierre-Louis';
const LAST_NAME_USER = 'My last name';
const BIOGRAPHY_USER = 'Pellentesque eu rhoncus velit. Ut at arcu tortor.';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Test CRUD org', () => {
  it.skip('should create an account, create an organization, add member to organization, then logout', () => {
    // Create new account
    const p1: LandingPage = new LandingPage();
    const EMAIL_USER = generateRandomEmail();
    const PASSWORD_USER = randomID();
    p1.fillSignupEmail(EMAIL_USER);
    p1.fillSignupPassword(PASSWORD_USER);
    const p2: HomePage = p1.signup();
    p2.assertIsEncrypting();

    // Edit profile
    p2.openUserMenu();
    const p3: ViewProfilePage = p2.clickProfile();
    p3.assertEmailExists(EMAIL_USER);
    const p4: EditProfilePage = p3.clickEdit();
    p4.assertEmailExists(EMAIL_USER);
    p4.fillFirstName(FIRST_NAME_USER);
    p4.fillLastName(LAST_NAME_USER);
    p4.fillBiography(BIOGRAPHY_USER);
    p4.clickSave();
    p4.assertFirstNameExists(FIRST_NAME_USER);
    p4.assertLastNameExists(LAST_NAME_USER);
    p4.assertBiographyExists(BIOGRAPHY_USER);
    const p5: ViewProfilePage = p4.clickArrowBack();
    p5.assertEmailExists(EMAIL_USER);
    p5.assertFirstNameExists(FIRST_NAME_USER);
    p5.assertLastNameExists(LAST_NAME_USER);
    p5.assertBiographyExists(BIOGRAPHY_USER);
    const p6: HomePage = p5.clickHome();

    // TODO: delete profile (the function is not implemented yet)
    // TODO: verify wallet

    // Create an organization
    const p7: OrganizationFormPage = p6.clickCreateAnOrganization();
    p7.fillOrgName(ORG_USER);
    p7.fillOrgAddress(ORG_USER);
    const p8: HomePage = p7.clickNext();
    p8.assertOrgExists(ORG_USER);

    // Add a member to this organization
    p8.openUserMenu();
    const p9: OrganizationFormPage = p8.clickOnOrganization(ORG_USER);
    p9.assertOrgNameExists(EMAIL_USER);
    p9.fillAndSelectEmail(PARTIAL_EMAIL_CYTEST, EMAIL_CYTEST);
    p9.assertEmailValidated(EMAIL_CYTEST);
    p9.selectRole(ROLE_CYTEST);
    p9.clickAdd();
    p9.assertOrgNameExists(EMAIL_CYTEST);
    // TODO: delete this member (the function is not implemented yet)

    const p10: HomePage = p9.clickHome();
    p10.assertOrgExists(ORG_USER);
    p10.openUserMenu();
    const p11: LandingPage = p10.clickLogout();
  });
});
