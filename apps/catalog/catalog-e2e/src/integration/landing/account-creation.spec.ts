/// <reference types="cypress" />

import { LandingPage } from '../../support/pages/landing';
import { User, serverId, testEmail } from "@blockframes/e2e/utils";
import { clearDataAndPrepareTest, assertMoveTo } from "@blockframes/e2e/utils/functions";
import { AuthIdentityPage } from "@blockframes/e2e/pages/auth";
import { OrganizationLiteFormPage } from "@blockframes/e2e/pages/organization";
import { ORGANIZATION } from '@blockframes/e2e/fixtures/orgs';
import { MessageListResult } from "cypress-mailosaur";

const subjects = [
  "A new organization has been created",
  "New user connexion",
  "Archipel Content - Email address verification"
];

const USER: Partial<User> = {
  email: `dev+user-${Date.now()}@cascade8.com`,
  password: 'cypress',
  firstName: 'Catalog',
  lastName: 'User'
}

const WRONG_EMAIL_FORM = 'wrongform*email!com';
const WRONG_PASSWORD = 'wrongpassword';
const SHORT_PASSWORD = '123';
const LONG_PASSWORD = '123456789123456789123456789';

const CREATEPATH = '/c/organization/create-congratulations';
const IDENTITYPATH = '/auth/identity';

// TEST

beforeEach(() => {
  clearDataAndPrepareTest();
  cy.visit('/');
  const p1 = new LandingPage();
  p1.clickSignup();
})

// USER TEST
describe.only('User can create new account and create a new organization', () => {
  beforeEach(() => {
      //Clear all messages on server before the test
      cy.mailosaurDeleteAllMessages(serverId).then(() => {
        cy.log('Inbox empty. Ready to roll..');
      })
  });

  it('Fill all the fields', () => {
    const newOrg = {...ORGANIZATION, ...{email: testEmail}};
    const newOrgUSer = {...USER, ...{email: testEmail}};
    const p1 = new AuthIdentityPage();
    p1.fillUserInformations(newOrgUSer);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg(newOrg);

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.submitForm();
    assertMoveTo(CREATEPATH);
    cy.log(`{${USER.firstName} ${USER.lastName}} logged In!`);
  });

  it('Check emails are sent properly', () => {
    cy.mailosaurSearchMessages(serverId, {
      sentTo: testEmail
    }).then((result: MessageListResult) => {
      cy.log(`You've Got ${result.items.length} Mails! 💓`);
      const messages = result.items;
      messages.forEach(email => {
        cy.log(`Message: ${email.subject} ✅`);
        expect(subjects).to.include.members([email.subject]);
      });
    });
  });
});

//! This one is failing because of the data that are coming from Algolia. The data about organization are not prefilled in the
//! org form when a test user clicked on a existing organization. I don't know how I can prefilled the field with algolia data.
describe.skip('User can create new account and join an organization', () => {
  it('Fill all the fields', () => {
    const p1 = new AuthIdentityPage();
    p1.fillUserInformations(USER);

    const p2 = new OrganizationLiteFormPage();
    p2.joinExistingOrg(ORGANIZATION);
    //! try here to intercept Algolia ?
    p2.verifyInformation(ORGANIZATION, 'seller');

    // p1.clickTermsAndCondition();
    // p1.clickPrivacyPolicy();
    // p1.submitForm();
    // assertMoveTo(JOINPATH)
    // cy.log(`{${USER.firstName} ${USER.lastName}} logged In!`);
  });
});

describe('Try with each fields except one', () => {
  it('Fill all the fields except email', () => {
    const p1 = new AuthIdentityPage();
    p1.fillSignupExceptOne(USER, 'email');

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  });

  it('Fill all the fields except name', () => {
    const p1 = new AuthIdentityPage();
    const newEmail = `dev+name${Date.now()}@cascade8.com`;
    p1.fillSignupExceptOne(USER, 'name', newEmail);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  });

  it('Fill all the fields except surname', () => {
    const p1 = new AuthIdentityPage();
    const newEmail = `dev+surname${Date.now()}@cascade8.com`;
    p1.fillSignupExceptOne(USER, 'surname', newEmail);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  });

  it('Fill all the fields except password', () => {
    const p1 = new AuthIdentityPage();
    const newEmail = `dev+pwd${Date.now()}@cascade8.com`;
    p1.fillSignupExceptOne(USER, 'password', newEmail);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  });

  it('Fill all the fields except password confirm', () => {
    const p1 = new AuthIdentityPage();
    const newEmail =`dev+pwdC${Date.now()}@cascade8.com`;
    p1.fillSignupExceptOne(USER, 'passwordConfirm', newEmail);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  });
});

describe('Try email address', () => {
  it('use already exist email address', () => {
    const p1 = new AuthIdentityPage();
    p1.fillUserInformations(USER);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.submitForm();
    assertMoveTo(IDENTITYPATH);
  })
  it('use wrong format email address', () => {
    const p1 = new AuthIdentityPage();
    p1.fillEmail(WRONG_EMAIL_FORM);
    p1.fillFirstAndLastName(USER);
    p1.fillPasswordAndConfirmPassword(USER.password);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  })
});

describe('Try password', () => {
  it('Try with different passwords in password confirm', () => {
    const p1 = new AuthIdentityPage();
    const newEmail =`dev+wrongPwd${Date.now()}@cascade8.com`;
    p1.fillEmail(newEmail);
    p1.fillFirstAndLastName(USER);
    p1.fillPassword(USER.password);
    p1.fillConfirmedPassword(WRONG_PASSWORD);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  })
  it('Try with less than 6 characters', () => {
    const p1 = new AuthIdentityPage();
    const newEmail =`dev+shortPwd${Date.now()}@cascade8.com`;
    p1.fillEmail(newEmail);
    p1.fillFirstAndLastName(USER);
    p1.fillPasswordAndConfirmPassword(SHORT_PASSWORD);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  })
  it('Try with more than 24 characters', () => {
    const p1 = new AuthIdentityPage();
    const newEmail =`dev+longPwd${Date.now()}@cascade8.com`;
    p1.fillEmail(newEmail);
    p1.fillFirstAndLastName(USER);
    p1.fillPasswordAndConfirmPassword(LONG_PASSWORD);

    const p2 = new OrganizationLiteFormPage();
    p2.createNewDashboardOrg();

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  })

})

// ORGANIZATION TEST
describe('Create a new account and org, but doesn\'t fill one field of the org', () => {
  it('Try without the company name field', () => {
    const p1 = new AuthIdentityPage();
    p1.fillUserInformations(USER);

    const p2 = new OrganizationLiteFormPage();
    p2.fillAllExceptOne(ORGANIZATION, 'denomination');

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  })
  it('Try without the role field', () => {
    const p1 = new AuthIdentityPage();
    p1.fillUserInformations(USER);

    const p2 = new OrganizationLiteFormPage();
    p2.fillAllExceptOne(ORGANIZATION, 'role');

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  })
  it('Try without the activity field', () => {
    const p1 = new AuthIdentityPage();
    p1.fillUserInformations(USER);

    const p2 = new OrganizationLiteFormPage();
    p2.fillAllExceptOne(ORGANIZATION, 'activity');

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  })
  it('Try without the nationality field', () => {
    const p1 = new AuthIdentityPage();
    p1.fillUserInformations(USER);

    const p2 = new OrganizationLiteFormPage();
    p2.fillAllExceptOne(ORGANIZATION, 'nationality');

    p1.clickTermsAndCondition();
    p1.clickPrivacyPolicy();
    p1.checkSignUpButtonIsDisabled();
    assertMoveTo(IDENTITYPATH);
  })
})
