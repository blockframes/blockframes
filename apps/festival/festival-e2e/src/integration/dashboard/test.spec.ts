/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />

import { clearDataAndPrepareTest, signIn } from "@blockframes/e2e/utils/functions";
import { AuthLoginPage } from "@blockframes/e2e/pages/auth";
import { OrganizationHomePage } from "@blockframes/e2e/pages/organization";
import { LandingPage } from '../../support/pages/landing';
import { User, QueryInferface } from '../../fixtures';

describe('User create a screening', () => {
  const userFixture = new User(); 
  beforeEach(() => {
    clearDataAndPrepareTest();
    //cy.visit('/');    
    //const p1 = new LandingPage();
    //p1.clickSignup();    
  });

  it('Test', () => {
    const u = userFixture.get({exist: false, index: 0 });
    cy.log(u);
    console.log(u);

    expect(true).to.be.true;
  })

  it('Fill all the fields appropriately', () => {
    const p1 = new AuthLoginPage();
    const newUser = userFixture.get({exist: false, index: 0 })[0];
    p1.fillSignup(newUser);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    const p2: OrganizationHomePage = p1.clickSignupToOrgHome();
    p2.assertMoveToOrgHomepage();
  });  

  it.only('Sign-in existing User', () => {
    //const p1 = new AuthLoginPage();
    let usrJacqueline = userFixture.get({exist: true, 
        key: "email", value: "jacqueline@fake.com" })[0];
    usrJacqueline.password = 'blockframes';
    signIn(usrJacqueline);
    // p1.clickTermsAndCondition();
    // p1.clickPrivacyPolicy();
    // const p2: OrganizationHomePage = p1.clickSignupToOrgHome();
    // p2.assertMoveToOrgHomepage();
  });  


});
