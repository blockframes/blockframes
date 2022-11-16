import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  check,
  get,
  assertUrlIncludes,
  // cypress specific functions
  addNewCompany,
  fillCommonInputs,
  // firebase-utils
  validateOrg,
  snackbarShould,
} from '@blockframes/testing/cypress/browser';
import {
  newUser1,
  newUser2,
  newOrg2,
  dashboardData,
  orgInvitation,
  meetingInvitation,
  meetingEvent,
  meetingDocIndex,
} from '../../fixtures/authentification/signup';
import { territories, orgActivity } from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';

const { org, orgAdmin, permissions } = dashboardData;
const orgInvitationCode = 'E2eOrgInvitCode';
const meetingInvitationCode = 'E2eMeetingInvitCode';

const injectedData = {
  [`users/${orgAdmin.uid}`]: orgAdmin,
  [`users/${newUser1.uid}`]: { uid: newUser1.uid, email: newUser1.email },
  [`users/${newUser2.uid}`]: { uid: newUser2.uid, email: newUser2.email },
  [`orgs/${org.id}`]: org,
  [`permissions/${permissions.id}`]: permissions,
  [`invitations/${orgInvitation.id}`]: orgInvitation,
  [`invitations/${meetingInvitation.id}`]: meetingInvitation,
  [`events/${meetingEvent.id}`]: meetingEvent,
  [`docsIndex/${meetingEvent.id}`]: meetingDocIndex,
};

describe('Signup following an invitation', () => {
  beforeEach(() => {
    cy.visit('');
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    browserAuth.clearBrowserAuth();
    maintenance.start();
    adminAuth.createUser({ uid: orgAdmin.uid, email: orgAdmin.email, emailVerified: true });
    adminAuth.createUser({ uid: newUser1.uid, email: newUser1.email, emailVerified: true, password: orgInvitationCode });
    adminAuth.createUser({ uid: newUser2.uid, email: newUser2.email, emailVerified: true, password: meetingInvitationCode });
    firestore.create([injectedData]);
    maintenance.end();
  });

  it('User invited by an organization admin can signup', () => {
    const newUser = newUser1;
    cy.visit(`auth/identity?code=${orgInvitationCode}&email=${newUser.email}`);
    get('cookies').click();
    get('email').should('be.disabled').invoke('val').should('contain', newUser.email);
    fillCommonInputs(newUser, true);
    get('organization').should('be.disabled').invoke('val').should('contain', org.name);
    get('activity').should('contain', orgActivity[org.activity]);
    get('country').should('contain', territories[org.addresses.main.country]);
    get('invitation-code').find('input').invoke('val').should('contain', orgInvitationCode);
    get('submit').click();
    assertUrlIncludes('c/o/dashboard/home');
    //check organization data
    get('auth-user').click();
    get('organization').click();
    get('header')
      .should('contain', org.name)
      .and('contain', orgActivity[org.activity])
      .and('contain', territories[org.addresses.main.country]);
    get('Members').click();
    get('row_0_col_1').should('contain', orgAdmin.firstName);
    get('row_0_col_2').should('contain', orgAdmin.lastName);
    get('row_0_col_3').should('contain', orgAdmin.email);
    get('row_0_col_5').should('contain', 'Super Admin');
    get('row_1_col_1').should('contain', newUser.firstName);
    get('row_1_col_2').should('contain', newUser.lastName);
    get('row_1_col_3').should('contain', newUser.email);
    get('row_1_col_5').should('contain', 'Member');
  });

  it('User invited by an organization admin cannot signup if the form is invalid', () => {
    const newUser = newUser1;
    cy.visit(`auth/identity?code=${orgInvitationCode}&email=${newUser.email}`);
    get('cookies').click();
    get('submit').should('be.disabled');
    checkRequiredErrors(['first-name', 'last-name', 'password', 'password-confirm'], true);
    get('first-name').type(newUser.firstName);
    get('last-name').type(newUser.lastName);
    get('password').find('input').type('short');
    get('password-confirm').find('input').type(USER_FIXTURES_PASSWORD);
    get('short-password').should('exist');
    get('password-confirm-mismatch').should('exist');
    checkRequiredErrors(['first-name', 'last-name', 'password', 'password-confirm']);
    get('password').find('input').clear().type('ThisIsWayTooLongForAPassword');
    get('long-password').should('exist');
    get('password').find('input').clear().type(orgInvitationCode);
    get('same-password').should('exist');
    get('submit').should('be.disabled');
    get('password').find('input').clear().type(USER_FIXTURES_PASSWORD);
    get('same-password').should('not.exist');
    get('password-confirm-mismatch').should('not.exist');
    get('submit').should('be.disabled');
    check('terms');
    check('gdpr');
    get('submit').should('be.enabled');
  });

  it('User invited by an organization admin cannot signup with an invalid code', () => {
    const newUser = newUser1;
    cy.visit(`auth/identity?code=${orgInvitationCode}&email=${newUser.email}`);
    get('cookies').click();
    get('submit').should('be.disabled');
    fillCommonInputs(newUser, true);
    get('invitation-code').find('input').clear().type('WrongCode');
    get('submit').click();
    snackbarShould('contain', 'Incorrect Invitation Pass. Please check your invitation email.');
  });

  it('User invited for an event can signup', () => {
    const newUser = newUser2;
    const newOrg = newOrg2;
    cy.visit(`auth/identity?code=${meetingInvitationCode}&email=${newUser.email}`);
    get('cookies').click();
    get('email').should('be.disabled').invoke('val').should('contain', newUser.email);
    fillCommonInputs(newUser, true);
    get('organization').should('contain', '');
    addNewCompany(newOrg);
    get('invitation-code').find('input').invoke('val').should('contain', meetingInvitationCode);
    get('submit').click();
    snackbarShould(
      'contain',
      'Your User Account was successfully created. Please wait for our team to check your Company Information.'
    );
    validateOrg(newOrg.name);
    get('org-approval-ok').should('exist');
    get('email-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    get('skip-preferences').click();
    //check organization data
    get('auth-user').click();
    get('organization').click();
    get('header')
      .should('contain', newOrg.name)
      .and('contain', orgActivity[newOrg.activity])
      .and('contain', territories[newOrg.addresses.main.country]);
    get('Members').click();
    get('row_0_col_1').should('contain', newUser.firstName);
    get('row_0_col_2').should('contain', newUser.lastName);
    get('row_0_col_3').should('contain', newUser.email);
    get('row_0_col_5').should('contain', 'Super Admin');
  });
});

function checkRequiredErrors(selectors: string[], focusAndBlur?: boolean) {
  for (const selector of selectors) {
    if (selector.includes('password') && focusAndBlur) {
      get(selector).find('input').focus().blur();
    } else if (focusAndBlur) {
      get(selector).focus().blur();
    }
    get(`${selector}-required`).should(focusAndBlur ? 'exist' : 'not.exist');
  }
}
