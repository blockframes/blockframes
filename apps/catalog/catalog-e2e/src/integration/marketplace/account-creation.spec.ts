/// <reference types="cypress" />

import { OrganizationHomePage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { WelcomeViewPage, LoginViewPage } from '../../support/pages/auth';

const USER: Partial<User> = {
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

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth')
  cy.viewport('ipad-2', 'landscape');
  const p1: WelcomeViewPage = new WelcomeViewPage();
  const p2: LoginViewPage = p1.clickCallToAction();
})

describe('User can create new account', () => {
  it('Fill all the fields appropriately', () => {
    const p1 = new LoginViewPage();
    p1.fillSignup(USER);
    p1.clickTermsAndCondition();
    const p2: OrganizationHomePage = p1.clickSignupToOrgHome();
    p2.assertMoveToOrgHomepage();
  });
});

describe('Try with each fields except one', () => {
  it('Fill all the fields except email', () => {
    const p1 = new LoginViewPage();
    p1.fillSignupExceptOne(USER, 'email');
    p1.clickTermsAndCondition();
    p1.clickSignup();
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
