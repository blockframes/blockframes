/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />

import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import { AuthLoginPage } from '@blockframes/e2e/pages/auth';
import { OrganizationHomePage } from '@blockframes/e2e/pages/organization';
import { LandingPage } from '../../support/pages/landing';

import { User } from '@blockframes/e2e/utils/type';
import newUser from '../../fixtures/new-user.json';

describe('User create a screening', () => {
  beforeEach(() => {
    clearDataAndPrepareTest();
    cy.visit('/');
    const p1 = new LandingPage();
    p1.clickSignup();
  });

  it('Fill all the fields appropriately', () => {
    cy.task('getUsers', null, { log: true, timeout: 9000 }).then(console.log); // ! Continue from here
    const p1 = new AuthLoginPage();
    p1.fillSignup(newUser.pop() as User);
    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    const p2: OrganizationHomePage = p1.clickSignupToOrgHome();
    p2.assertMoveToOrgHomepage();
  });
});
