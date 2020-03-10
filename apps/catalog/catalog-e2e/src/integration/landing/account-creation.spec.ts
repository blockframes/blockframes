/// <reference types="cypress" />

import { USERS } from '../../support/utils/users';
import { LoginViewPage } from '../../support/pages/auth';
import { LandingPage } from '../../support/pages/landing';
import { Organization } from '../../support/utils/type';
import { OrganizationHomePage, OrganizationCreatePage, OrganizationFindPage, OrganizationAppAccessPage, OrganizationCongratulationPage } from '../../support/pages/organization';
import { clearDataAndPrepareTest } from '../../support/utils/utils';

// Users without organization yet
const USER = USERS[49];
const USER2 = USERS[51];

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
      country: 'Germany'
    },
    IBAN: 'FR1420041010050500013M02606',
    BIC: 'CCBPFRPPVER',
    bankName: 'Cypress Bank',
    holderName: 'Cypress'
  }
}

// TEST

// Before each test, go to login page
beforeEach(() => {
  clearDataAndPrepareTest('/');
  const p1: LandingPage = new LandingPage();
  p1.clickLogin();
});

// FIND ORGANIZATION

describe('User can choose to find an organization', () => {
  it('Click on "Find your Organization"', () => {
    const p1 = new LoginViewPage();
    p1.fillSignin(USER);
    const p2: OrganizationHomePage = p1.clickSigninToOrgHome();
    p2.clickFindOrganization();
    const p3: OrganizationFindPage = p2.clickSubmitToFind();
    p3.assertMoveToOrgFindPage();
  });
});

// CREATE ORGANIZATION

describe('Try with all fields except name', () => {
  it('Fill all the fields except company name', () => {
    const p1 = new LoginViewPage();
    p1.fillSignin(USER);
    const p2: OrganizationHomePage = p1.clickSigninToOrgHome();
    p2.clickCreateOrganization();
    const p3: OrganizationCreatePage = p2.clickSubmitToCreate();
    // To exclude name from filling function, set second parameter to true
    p3.fillEveryFields(omit(ORGANIZATION, 'name'));
    // Since we expect an error, use false in parameter to not navigate to a new page
    p3.clickCreate(false);
    p3.assertMoveToOrgCreatePage();
  });
});

describe('Create an organization with minimum field', () => {
  it('Fill only the company name field', () => {
    const p1 = new LoginViewPage();
    p1.fillSignin(USER);
    const p2: OrganizationHomePage = p1.clickSigninToOrgHome();
    p2.clickCreateOrganization();
    const p3: OrganizationCreatePage = p2.clickSubmitToCreate();
    p3.fillName(ORGANIZATION.name);
    const p4: OrganizationAppAccessPage = p3.clickCreate();
    p4.chooseMarketplace();
    const p5: OrganizationCongratulationPage = p4.clickSubmit();
    p5.assertMoveToOrgCongratulationPage();
  });
});

describe('Create an organization with all fields', () => {
  it('Fill all the fields', () => {
    const p1 = new LoginViewPage();
    p1.fillSignin(USER2);
    const p2: OrganizationHomePage = p1.clickSigninToOrgHome();
    p2.clickCreateOrganization();
    const p3: OrganizationCreatePage = p2.clickSubmitToCreate();
    p3.fillEveryFields(ORGANIZATION);
    const p4: OrganizationAppAccessPage = p3.clickCreate();
    p4.chooseDashboard();
    const p5: OrganizationCongratulationPage = p4.clickSubmit();
    p5.assertMoveToOrgCongratulationPage();
  });
});
