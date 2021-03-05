/// <reference types="cypress" />

import { AuthIdentityPage } from "@blockframes/e2e/pages/auth";
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
    const p1 = new LandingPage();
    p1.clickSignup();
  })

  it('A new user creates its account and a new organization', () => {
    const p1 = new AuthIdentityPage();
    acceptCookie();
    p1.fillUserInformations(user);
    const p2 = new OrganizationLiteFormPage();
    p2.createNewOrg();
    p2.fillOrganizationInformation();
    p2.chooseMarketplaceAccess();
    p1.fillPassword();
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.submitCreationOrg();
  })
})
