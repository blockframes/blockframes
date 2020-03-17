/// <reference types="cypress" />

import { USERS } from '../../support/utils/users';
import { LoginViewPage } from '../../support/pages/auth';
import { LandingPage } from '../../support/pages/landing';
import { Organization, User } from '../../support/utils/type';
import { OrganizationHomePage, OrganizationCreatePage, OrganizationFindPage, OrganizationAppAccessPage, OrganizationCongratulationPage } from '../../support/pages/organization';
import { clearDataAndPrepareTest } from '../../support/utils/utils';

// Users without organization yet
const USER: Partial<User> = USERS[49];
const USER2: Partial<User> = USERS[51];

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

function navigateToOrganizationHome(user: Partial<User>): OrganizationHomePage {
  const p1 = new LoginViewPage();
  p1.fillSignin(user);
  return p1.clickSigninToOrgHome();
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
    const p1: OrganizationHomePage = navigateToOrganizationHome(USER);
    p1.clickFindOrganization();
    const p2: OrganizationFindPage = p1.clickSubmitToFind();
    p2.assertMoveToOrgFindPage();
  });
});

// CREATE ORGANIZATION

describe('Try with all fields except name', () => {
  it('Fill all the fields except company name', () => {
    const p1: OrganizationHomePage = navigateToOrganizationHome(USER);
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    // Fill all fields except name
    const ORG_WITHOUT_NAME = { ...ORGANIZATION };
    delete ORG_WITHOUT_NAME.name;
    p2.fillEveryFields(ORG_WITHOUT_NAME);
    // Since we expect an error, use false in parameter to not navigate to a new page
    p2.clickCreate(false);
    p2.assertMoveToOrgCreatePage();
  });
});

describe('Create an organization with minimum field', () => {
  it('Fill only the company name field', () => {
    const p1: OrganizationHomePage = navigateToOrganizationHome(USER);
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    p2.fillName(ORGANIZATION.name);
    const p3: OrganizationAppAccessPage = p2.clickCreate();
    p3.chooseMarketplace();
    const p4: OrganizationCongratulationPage = p3.clickSubmit();
    p4.assertMoveToOrgCongratulationPage();
  });
});

describe('Create an organization with all fields', () => {
  it('Fill all the fields', () => {
    const p1: OrganizationHomePage = navigateToOrganizationHome(USER2);
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    p2.fillEveryFields(ORGANIZATION);
    const p3: OrganizationAppAccessPage = p2.clickCreate();
    p3.chooseDashboard();
    const p4: OrganizationCongratulationPage = p3.clickSubmit();
    p4.assertMoveToOrgCongratulationPage();
  });
});
