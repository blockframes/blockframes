/// <reference types="cypress" />

import { AuthIdentityPage, AuthLoginPage } from "@blockframes/e2e/pages/auth";
import { OrganizationLiteFormPage } from "@blockframes/e2e/pages/organization";
import { clearDataAndPrepareTest, acceptCookie } from "@blockframes/e2e/utils";
import { LandingPage } from "../../support/pages/landing"
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { Orgs, ORG } from '@blockframes/e2e/fixtures/orgs';

const userFixture = new User();
const orgsFixture = new Orgs();
const user  = userFixture.getByUID(USER.Vincent);
const org = orgsFixture.getByID(ORG.Xara);


describe('New user registers', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
  })

  it('A new user creates its account and a new organization', () => {
    const p1 = new LandingPage();
    p1.clickSignup();
    const p2 = new AuthIdentityPage();
    acceptCookie();
    p2.fillUserInformations(user);
    const p3 = new OrganizationLiteFormPage();
    p3.createNewOrg();
    p3.fillOrganizationInformation();
    p3.chooseMarketplaceAccess();
    p2.fillPassword();
    p2.clickTermsAndCondition();
    p2.clickPrivacyPolicy();
    p2.submitCreationOrg();
  });

  it.only('A new user creates its account and join an org', () => {
    const p1 = new LandingPage();
    p1.clickSignup();
    const p2 = new AuthIdentityPage();
    acceptCookie();
    p2.fillUserInformations(user);
    const p3 = new OrganizationLiteFormPage();
    p3.joinExistingOrg();
    p2.fillPassword();
    p2.clickTermsAndCondition();
    p2.clickPrivacyPolicy();
    p2.submitJoinOrg();
  });

  it('An user connects to the app', () => {
    const p1 = new LandingPage();
    p1.clickLogin();
    const p2 = new AuthLoginPage();
    p2.fillSignin(user);
    p2.clickSignIn();
  });

})
