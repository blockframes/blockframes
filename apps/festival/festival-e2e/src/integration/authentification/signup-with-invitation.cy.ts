import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  gmail,
  maintenance,
  // cypress commands
  check,
  get,
  assertUrlIncludes,
  // cypress specific functions
  addNewCompany,
  fillCommonInputs,
  interceptEmail,
  // firebase-utils
  validateOrg,
  snackbarShould,
  assertMultipleTexts,
  //helpers
  getTextBody,
  getSubject,
  assertUrl,
  deleteOrg,
} from '@blockframes/testing/cypress/browser';
import {
  userWithJoinOrgInvitation,
  userWithEventInvitation,
  userWithEventInvitationOrg,
  dashboardData,
  orgInvitation,
  meetingInvitation,
  meetingEvent,
  meetingDocIndex,
} from '../../fixtures/authentification/signup-with-invitation';
import { territories, orgActivity, USER_FIXTURES_PASSWORD } from '@blockframes/model';
import { e2eSupportEmail } from '@blockframes/utils/constants';

const { org, orgAdmin, permissions } = dashboardData;
const orgInvitationCode = 'E2eOrgInvitCode';
const meetingInvitationCode = 'E2eMeetingInvitCode';

const injectedData = {
  [`users/${orgAdmin.uid}`]: orgAdmin,
  [`users/${userWithJoinOrgInvitation.uid}`]: { uid: userWithJoinOrgInvitation.uid, email: userWithJoinOrgInvitation.email },
  [`users/${userWithEventInvitation.uid}`]: { uid: userWithEventInvitation.uid, email: userWithEventInvitation.email },
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
    maintenance.start();
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    browserAuth.clearBrowserAuth();
    adminAuth.createUser({ uid: orgAdmin.uid, email: orgAdmin.email, emailVerified: true });
    adminAuth.createUser({
      uid: userWithJoinOrgInvitation.uid,
      email: userWithJoinOrgInvitation.email,
      emailVerified: true,
      password: orgInvitationCode,
    });
    adminAuth.createUser({
      uid: userWithEventInvitation.uid,
      email: userWithEventInvitation.email,
      emailVerified: true,
      password: meetingInvitationCode,
    });
    firestore.create([injectedData]);
    maintenance.end();
  });

  it('User invited by an organization admin can signup', () => {
    const newUser = userWithJoinOrgInvitation;
    cy.visit(`auth/identity?code=${orgInvitationCode}&email=${encodeURIComponent(newUser.email)}`);
    get('cookies').click();
    get('email').should('be.disabled').and('have.value', newUser.email);
    fillCommonInputs(newUser, false);
    get('organization').should('be.disabled').invoke('val').should('contain', org.name);
    get('activity').should('contain', orgActivity[org.activity]);
    get('country').should('contain', territories[org.addresses.main.country]);
    get('invitation-code').find('input').invoke('val').should('contain', orgInvitationCode);
    get('submit').click();
    assertUrlIncludes('c/o/dashboard/home');
    //check organization data
    get('auth-user').click();
    get('widget-organization').click();
    assertMultipleTexts('header', [org.name, orgActivity[org.activity], territories[org.addresses.main.country]]);
    get('Members').click();
    get('row_0_col_1').should('contain', orgAdmin.firstName);
    get('row_0_col_2').should('contain', orgAdmin.lastName);
    get('row_0_col_3').should('contain', orgAdmin.email);
    get('row_0_col_5').should('contain', 'Super Admin');
    get('row_1_col_1').should('contain', newUser.firstName);
    get('row_1_col_2').should('contain', newUser.lastName);
    get('row_1_col_3').should('contain', newUser.email);
    get('row_1_col_5').should('contain', 'Member');
    interceptEmail(`to:${e2eSupportEmail}`).then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include(newUser.email);
      gmail.deleteEmail(mail.id);
    });
    interceptEmail(`to:${orgAdmin.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.include(`${newUser.firstName} ${newUser.lastName} accepted your invitation to join ${org.name}`);
      gmail.deleteEmail(mail.id);
    });
  });

  it('User invited by an organization admin cannot signup if the form is invalid', () => {
    const newUser = userWithJoinOrgInvitation;
    cy.visit(`auth/identity?code=${orgInvitationCode}&email=${encodeURIComponent(newUser.email)}`);
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
    const newUser = userWithJoinOrgInvitation;
    cy.visit(`auth/identity?code=${orgInvitationCode}&email=${encodeURIComponent(newUser.email)}`);
    get('cookies').click();
    get('submit').should('be.disabled');
    fillCommonInputs(newUser, false);
    get('invitation-code').find('input').clear().type('WrongCode');
    get('submit').click();
    snackbarShould('contain', 'Incorrect Invitation Pass. Please check your invitation email.');
  });

  it('User invited for an event can signup', () => {
    const newUser = userWithEventInvitation;
    const newOrg = userWithEventInvitationOrg;
    deleteOrg(newOrg.name); // Should delete org from Algolia in case of previous test failure
    cy.visit(`auth/identity?code=${meetingInvitationCode}&email=${encodeURIComponent(newUser.email)}`);
    get('cookies').click();
    get('email').should('be.disabled').invoke('val').should('contain', newUser.email);
    fillCommonInputs(newUser, false);
    get('organization').should('contain', '');
    addNewCompany(newOrg);
    get('invitation-code').find('input').invoke('val').should('contain', meetingInvitationCode);
    get('submit').click();
    snackbarShould(
      'contain',
      'Your User Account was successfully created. Please wait for our team to check your Company Information.'
    );
    assertUrl('c/organization/create-congratulations');
    validateOrg(newOrg.name);
    get('org-approval-ok').should('exist');
    get('email-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    //check organization data
    get('auth-user').click();
    get('widget-organization').click();
    assertMultipleTexts('header', [newOrg.name, orgActivity[newOrg.activity], territories[newOrg.addresses.main.country]]);
    get('Members').click();
    get('row_0_col_1').should('contain', newUser.firstName);
    get('row_0_col_2').should('contain', newUser.lastName);
    get('row_0_col_3').should('contain', newUser.email);
    get('row_0_col_5').should('contain', 'Super Admin');
    interceptEmail(`subject:Archipel Market - ${newOrg.name} was created and needs a review`).then(mail => gmail.deleteEmail(mail.id));
    interceptEmail(`to:${e2eSupportEmail}`).then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include(newUser.email);
      gmail.deleteEmail(mail.id);
    });
    interceptEmail(`to:${newUser.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.include('Congratulations! Your organization was successfully created on Archipel Market');
      gmail.deleteEmail(mail.id);
    });
  });
});

function checkRequiredErrors(selectors: string[], focusAndBlur?: boolean) {
  // .focus = enter inpout
  // .blur  = leave input
  // we use .focus.blur to trigger the 'required' errors
  for (const selector of selectors) {
    if (selector.includes('password') && focusAndBlur) {
      get(selector).find('input').focus().blur();
    } else if (focusAndBlur) {
      get(selector).focus().blur();
    }
    get(`${selector}-required`).should(focusAndBlur ? 'exist' : 'not.exist');
  }
}
