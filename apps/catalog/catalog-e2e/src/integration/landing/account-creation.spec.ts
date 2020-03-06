/// <reference types="cypress" />

import { USERS } from '../../support/utils/users';
import {  LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';
import { Organization } from '../../support/utils/type';
import { OrganizationHomePage, OrganizationCreatePage, OrganizationFindPage, OrganizationAppAccessPage, OrganizationCongratulationPage } from '../../support/pages/organization';

// Temporary user for local test
const USER = USERS[0];

const ORGANIZATION: Organization = {
  name: 'Cypress',
  email: `${Date.now()}@cypress.com`,
  address: {
    street: '42 test road',
    zipCode: '69001',
    city: 'Testville',
    country: 'France',
    phoneNumber: '+334 857 953'
  },
  activity: 'Testing',
  fiscalNumber: '95 14 958 641 215 C',

  bankAccount: {
    address: {
      street: '21 gold street',
      zipCode: '69001',
      city: 'Moneytown',
      country: 'Germany',
      phoneNumber: '+335 514 554'
    },
    IBAN: 'FR1420041010050500013M02606',
    BIC: 'CCBPFRPPVER',
    bankName: 'Cypress Bank',
    holderName: 'Cypress'
  }
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

describe('User can choose to create an organization', () => {
  it.skip('Click on "Create your Organization"', () => {
    const p1 = new OrganizationHomePage();
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    p2.assertMoveToOrgCreatePage();
  });
});

describe('User can choose to find an organization', () => {
  it.skip('Click on "Find your Organization"', () => {
    const p1 = new OrganizationHomePage();
    p1.clickFindOrganization();
    const p2: OrganizationFindPage = p1.clickSubmitToFind();
    p2.assertMoveToOrgFindPage();
  });
});

describe('Create an organization with minimum field', () => {
  it.skip('Fill only the company name field', () => {
    const p1 = new OrganizationHomePage();
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    p2.fillCompanyName(ORGANIZATION.name);
    const p3: OrganizationAppAccessPage = p2.clickCreate();
    p3.chooseMarketplace();
    const p4: OrganizationCongratulationPage = p3.clickSubmit();
    p4.assertMoveToOrgCongratulationPage();
  })
})

describe('Try with all fields except name', () => {
  it('Fill all the fields except company name', () => {
    const p1 = new OrganizationHomePage();
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    p2.fillEveryFields(ORGANIZATION, true);
    p2.assertMoveToOrgCreatePage();
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
