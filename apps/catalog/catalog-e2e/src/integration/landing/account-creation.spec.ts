/// <reference types="cypress" />

import { User } from "@blockframes/e2e/utils/type";
import { clearDataAndPrepareTest } from "@blockframes/e2e/utils/functions";
import { AuthWelcomePage, AuthLoginPage } from "@blockframes/e2e/pages/auth";
import { OrganizationHomePage } from "@blockframes/e2e/pages/organization";

const USER: Partial<User> = {
  email: `${Date.now()}@cypress.com`,
  password: 'cypress',
  firstName: 'cypress',
  lastName: 'cypress'
}

const WRONG_EMAIL_FORM = 'wrongform*email!com';
const WRONG_PASSWORD = 'wrongpassword';
const SHORT_PASSWORD = '123';
const LONG_PASSWORD = '123456789123456789123456789';

// TEST

beforeEach(() => {
  clearDataAndPrepareTest();
  const p1: AuthWelcomePage = new AuthWelcomePage();
  p1.clickCallToAction();
})

describe('User can create new account', () => {
  it('Fill all the fields appropriately', () => {
    const p1 = new AuthLoginPage();
    p1.fillSignup(USER);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    const p2: OrganizationHomePage = p1.clickSignupToOrgHome();
    p2.assertMoveToOrgHomepage();
  });
});

describe('Try with each fields except one', () => {
  it('Fill all the fields except email', () => {
    const p1 = new AuthLoginPage();
    p1.fillSignupExceptOne(USER, 'email');
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  });

  it('Fill all the fields except name', () => {
    const p1 = new AuthLoginPage();
    const newEmail = `name${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'name', newEmail);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  });

  it('Fill all the fields except surname', () => {
    const p1 = new AuthLoginPage();
    const newEmail = `surname${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'surname', newEmail);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  });

  it('Fill all the fields except password', () => {
    const p1 = new AuthLoginPage();
    const newEmail = `pwd${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'password', newEmail);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  });

  it('Fill all the fields except password confirm', () => {
    const p1 = new AuthLoginPage();
    const newEmail =`pwdC${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'passwordConfirm', newEmail);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  });
});

describe('Try email address', () => {
  it('use already exist email address', () => {
    const p1 = new AuthLoginPage();
    p1.fillSignup(USER);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  })
  it('use wrong format email address', () => {
    const p1 = new AuthLoginPage();
    p1.fillEmailInSignup(WRONG_EMAIL_FORM);
    p1.fillSignupExceptOne(USER, 'email');
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  })
});

describe('Try password', () => {
  it('Try with different passwords in password confirm', () => {
    const p1 = new AuthLoginPage();
    const newEmail =`wrongPwd${Date.now()}@cypress.com`;
    p1.fillSignupExceptOne(USER, 'passwordConfirm', newEmail);
    p1.fillPasswordConfirmInSignup(WRONG_PASSWORD);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  })
  it('Try with less than 6 characters', () => {
    const p1 = new AuthLoginPage();
    const newEmail =`shortPwd${Date.now()}@cypress.com`;
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.firstName);
    p1.fillSurnameInSignup(USER.lastName);
    p1.fillPasswordInSignup(SHORT_PASSWORD);
    p1.fillPasswordConfirmInSignup(SHORT_PASSWORD);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  })
  it('Try with more than 24 characters', () => {
    const p1 = new AuthLoginPage();
    const newEmail =`longPwd${Date.now()}@cypress.com`;
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.firstName);
    p1.fillSurnameInSignup(USER.lastName);
    p1.fillPasswordInSignup(LONG_PASSWORD);
    p1.fillPasswordConfirmInSignup(LONG_PASSWORD);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.clickSignup();
    p1.assertStayInLoginView();
  })
})
