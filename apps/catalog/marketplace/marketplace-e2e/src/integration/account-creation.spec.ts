/// <reference types="cypress" />

import { WelcomeViewPage, LoginViewPage, OrganizationHomePage } from '../support/pages';
import { User } from '../support/utils/type';

const USER: User = {
  email: `${Date.now()}@cypress.com`,
  password: 'cypress',
  name: 'cypress',
  surname: 'cypress'
}

const wrongEmailForm = 'wrongform*email!com';
const wrongPassword = 'wrongpassword';
const shortPaasword = '123';
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

// TODO: after each, delete created account by cypress from firestore
describe('User can create new account', () => {
  it('Fill all the fields appropriately', () => {
    const p1 = new LoginViewPage();
    p1.fillEmailInSignup(USER.email);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(USER.password);
    p1.fillPasswordConfirmInSignup(USER.password);
    p1.clickTermsAndCondition();
    const p2: OrganizationHomePage = p1.clickSignup();
    p2.assertMoveToOrgHomepage();
  });
});

describe('Try with each fields except one', () => {
  it('Fill all the fields except email', () => {
    const p1 = new LoginViewPage();
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(USER.password);
    p1.fillPasswordConfirmInSignup(USER.password);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  });

  it('Fill all the fields except name', () => {
    const p1 = new LoginViewPage();
    const newEmail = USER.email + Date.now();
    p1.fillEmailInSignup(newEmail);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(USER.password);
    p1.fillPasswordConfirmInSignup(USER.password);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  });

  it('Fill all the fields except surname', () => {
    const p1 = new LoginViewPage();
    const newEmail = USER.email + Date.now();
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.name);
    p1.fillPasswordInSignup(USER.password);
    p1.fillPasswordConfirmInSignup(USER.password);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  });

  it('Fill all the fields except password', () => {
    const p1 = new LoginViewPage();
    const newEmail = USER.email + Date.now();
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordConfirmInSignup(USER.password);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  });

  it('Fill all the fields except password confirm', () => {
    const p1 = new LoginViewPage();
    const newEmail = USER.email + Date.now();
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname)
    p1.fillPasswordInSignup(USER.password);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  });
});

describe('Try email address', () => {
  it('use already exist email address', () => {
    const p1 = new LoginViewPage();
    p1.fillEmailInSignup(USER.email);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(USER.password);
    p1.fillPasswordConfirmInSignup(USER.password);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  })
  it('use wrong format email address', () => {
    const p1 = new LoginViewPage();
    p1.fillEmailInSignup(wrongEmailForm);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(USER.password);
    p1.fillPasswordConfirmInSignup(USER.password);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  })
});

describe('Try password', () => {
  it('Try with different passwords in password confirm', () => {
    const p1 = new LoginViewPage();
    const newEmail = USER.email + Date.now();
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(USER.password);
    p1.fillPasswordConfirmInSignup(wrongPassword);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  })
  it('Try with less than 6 characters', () => {
    const p1 = new LoginViewPage();
    const newEmail = USER.email + Date.now();
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(shortPaasword);
    p1.fillPasswordConfirmInSignup(shortPaasword);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  })
  it('Try with more than 24 characters', () => {
    const p1 = new LoginViewPage();
    const newEmail = USER.email + Date.now();
    p1.fillEmailInSignup(newEmail);
    p1.fillNameInSignup(USER.name);
    p1.fillSurnameInSignup(USER.surname);
    p1.fillPasswordInSignup(longPassword);
    p1.fillPasswordConfirmInSignup(longPassword);
    p1.clickTermsAndCondition();
    cy.get('[page-id=signup-form] button[type=submit]').click();
    p1.assertStayInLoginview();
  })
})
