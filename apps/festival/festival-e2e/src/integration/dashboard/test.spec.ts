/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />

import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { AuthLoginPage } from '@blockframes/e2e/pages/auth';
import { OrganizationHomePage } from '@blockframes/e2e/pages/organization';
import { LandingPage } from '../../support/pages/landing';

//import { User } from '@blockframes/e2e/utils/type';
//import { USERS } from '@blockframes/e2e/utils/users';
//import ExUsers from './users.fixture.json';
import { User, QueryInferface } from '../../fixtures';

describe('User create a screening', () => {

  beforeEach(() => {
    //clearDataAndPrepareTest();
    //cy.visit('/');    
    //const p1 = new LandingPage();
    //p1.clickSignup();
  });

  it('test', () => {
    const userFixture = new User()
    let user = userFixture.get({exist: true, key: 'email', value: 'julie@fake.com'});
    cy.log(user[0].email);
    console.log(user);
    user = userFixture.get({exist: false, index: 0});
    cy.log(user[0].email);
    console.log(user);
  })

  /*
  it('Fill all the fields appropriately', () => {
    const p1 = new AuthLoginPage();
    p1.fillSignup(newUser.pop() as User);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    const p2: OrganizationHomePage = p1.clickSignupToOrgHome();
    p2.assertMoveToOrgHomepage();
  });


  it.only('Sign-in existing User', () => {
    //const p1 = new AuthLoginPage();
    // let usrJacqueline = userFixture.get({exist: true, 
    //     key: "email", value: "jacqueline@fake.com" })[0];
    // usrJacqueline.password = 'blockframes';
    let user0 = ExUsers[0];
    user0.password = 'blockframes';
    signIn(user0);
    // p1.clickTermsAndCondition();
    // p1.clickPrivacyPolicy();
    // const p2: OrganizationHomePage = p1.clickSignupToOrgHome();
    // p2.assertMoveToOrgHomepage();
  });  

    */

});
