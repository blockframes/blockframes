﻿/// <reference types="cypress" />

import { LandingPage } from '../../support/pages/landing';
import { User, Organization } from '@blockframes/e2e/utils/type';
import { AuthLoginPage } from '@blockframes/e2e/pages/auth';
import { OrganizationHomePage, OrganizationFindPage, OrganizationCreatePage, OrganizationAppAccessPage, OrganizationCongratulationPage } from '@blockframes/e2e/pages/organization';
import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';

// Create new users
const USERS: Partial<User>[] = [
  {
    email: `dev+org-create-test-a${Date.now()}@cascade8.com`,
    password: 'blockframes',
    firstName: `${Date.now()}-Cypress first name1`,
    lastName: `${Date.now()}-Cypress last name1`
  },
  {
    email: `dev+org-create-test-b${Date.now()}@cascade8.com`,
    password: 'blockframes',
    firstName: `${Date.now()}-Cypress first name`,
    lastName: `${Date.now()}-Cypress last name`
  }
];

const ORGANIZATION: Organization = {
  id: 'Cy1234',
  name: `Org-${Date.now()}-Cypress`,
  email: `dev+${Date.now()}@cascade8.com`,
  address: {
    street: '42 test road',
    zipCode: '69001',
    city: 'Testville',
    country: 'France',
    phoneNumber: '+334 857 953'
  },
  activity: 'Distribution',
  fiscalNumber: '95 14 958 641 215 C',
  denomination: {
    full: 'Cypress & Party',
    public: 'Cypress & Party'
  }
};

const SECOND_ORGANIZATION_NAME = `SecondOrg-${Date.now()}-Cypress`;

/** Create a new user and navigate to organization home */
function createNewUserAndNavigate(user: Partial<User>) {
  const p1 = new LandingPage();
  const p2: AuthLoginPage = p1.clickSignup();
  p2.fillSignup(user);
  p2.clickTermsAndCondition();
  p2.clickPrivacyPolicy();
  return p2.clickSignupToOrgHome();
}

/** Log in an existing user and navigate to organization home */
function navigateToOrganizationHome(user: Partial<User>): OrganizationHomePage {
  const p1: LandingPage = new LandingPage();
  const p2: AuthLoginPage = p1.clickLogin();
  p2.fillSignin(user);
  return p2.clickSigninToOrgHome();
}

// Before each test, go to login page
beforeEach(() => {
  clearDataAndPrepareTest('/');
});

// FIND ORGANIZATION

describe('User can choose to find an organization', () => {
  it('Create a user, then click on "Find your Organization"', () => {
    const p1: OrganizationHomePage = createNewUserAndNavigate(USERS[0]);
    p1.clickFindOrganization();
    const p2: OrganizationFindPage = p1.clickSubmitToFind();
    p2.assertMoveToOrgFindPage();
  });
});

// CREATE ORGANIZATION

describe('Try with all fields except name', () => {
  it('Fill all the fields except company name', () => {
    const p1: OrganizationHomePage = navigateToOrganizationHome(USERS[0]);
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    // Fill all fields except name
    const ORG_WITHOUT_NAME = { ...ORGANIZATION };
    delete ORG_WITHOUT_NAME.name;
    p2.testOrgForm(ORG_WITHOUT_NAME);
    // Since we expect an error, use false in parameter to not navigate to a new page
    p2.clickCreate(false);
    p2.assertMoveToOrgCreatePage();
  });
});

describe('Create an organization with minimum field', () => {
  it('Fill only the company name field', () => {
    const p1: OrganizationHomePage = navigateToOrganizationHome(USERS[0]);
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
    const p1: OrganizationHomePage = createNewUserAndNavigate(USERS[1]);
    p1.clickCreateOrganization();
    const p2: OrganizationCreatePage = p1.clickSubmitToCreate();
    p2.fillName(SECOND_ORGANIZATION_NAME);
    const p3: OrganizationAppAccessPage = p2.clickCreate();
    p3.chooseDashboard();
    const p4: OrganizationCongratulationPage = p3.clickSubmit();
    p4.assertMoveToOrgCongratulationPage();
  });
});
