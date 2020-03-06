/// <reference types="cypress" />

import { USERS } from '../../support/utils/users';
import {  LoginViewPage } from '../../support/pages/auth';
import { OrganizationHomePage, OrganizationCreatePage, OrganizationFindPage } from '../../support/pages/landing';
import { LandingPage } from '../../support/pages/landing';

// Temporary user for local test
const USER = USERS[0];

const ORGANIZATION: Partial<Organization> = {
  email: `${Date.now()}@cypress.com`,
  password: 'cypress',
  name: 'cypress',
  surname: 'cypress'
}

const wrongEmailForm = 'wrongform*email!com';
const wrongPassword = 'wrongpassword';
const shortPassword = '123';
const longPassword = '123456789123456789123456789';

// TEST

// Before each test, connect to an existing user
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/')
  cy.viewport('ipad-2', 'landscape');
  const p1: LandingPage = new LandingPage();
  const p2: LoginViewPage = p1.clickLogin();
  p2.fillSignin(USER);
  const p3: OrganizationHomePage = p2.clickSigninToOrgHome();
  p3.assertMoveToOrgHomepage();
})

describe('User can choose to create an organization', () => {
  it('Click on "Create your Organization"', () => {
    const p1 = new OrganizationHomePage();
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    p2.assertMoveToOrgCreatePage();
  });
});

describe('User can choose to find an organization', () => {
  it('Click on "Find your Organization"', () => {
    const p1 = new OrganizationHomePage();
    p1.clickFindOrganization();
    const p2: OrganizationFindPage = p1.clickSubmitToFind();
    p2.assertMoveToOrgFindPage();
  });
});

describe('Try with each fields except one', () => {
  it('Fill all the fields except email', () => {
    const p1 = new LoginViewPage();
    p1.fillSignupExceptOne(USER, 'email');
    p1.clickTermsAndCondition();

    p1.assertStayInLoginview();
  });

  it('Fill all the fields except name', () => {
    const p1 = new LoginViewPage();
    const newEmail = `name${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'name', newEmail);
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  });

  it('Fill all the fields except surname', () => {
    const p1 = new LoginViewPage();
    const newEmail = `surname${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'surname', newEmail);
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  });

  it('Fill all the fields except password', () => {
    const p1 = new LoginViewPage();
    const newEmail = `pwd${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'password', newEmail);
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  });

  it('Fill all the fields except password confirm', () => {
    const p1 = new LoginViewPage();
    const newEmail =`pwdC${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'passwordConfirm', newEmail);
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  });
});

describe('Try email address', () => {
  it('use already exist email address', () => {
    const p1 = new LoginViewPage();
    p1.fillSignup(USER);
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  })
  it('use wrong format email address', () => {
    const p1 = new LoginViewPage();
    p1.fillEmailInSignup(wrongEmailForm);
    p1.fillSignupExceptOne(USER, 'email');
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  })
});

describe('Try password', () => {
  it('Try with different passwords in password confirm', () => {
    const p1 = new LoginViewPage();
    const newEmail =`wrongPwd${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'passwordConfirm', newEmail);
    p1.fillPasswordConfirmInSignup(wrongPassword);
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  })
  it('Try with less than 6 characters', () => {
    const p1 = new LoginViewPage();
    const newEmail =`shortPwd${Date.now()}@cypress.com`;
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(shortPassword);
    p1.fillPasswordConfirmInSignup(shortPassword);
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  })
  it('Try with more than 24 characters', () => {
    const p1 = new LoginViewPage();
    const newEmail =`longPwd${Date.now()}@cypress.com`;
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(longPassword);
    p1.fillPasswordConfirmInSignup(longPassword);
    p1.clickTermsAndCondition();
    p1.clickSignup();
    p1.assertStayInLoginview();
  })
})
