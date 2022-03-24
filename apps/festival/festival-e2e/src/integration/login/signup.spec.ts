

//TODO define proper way to import next line #8071
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  auth,
  get,
  getInList,
  check,
  assertUrl,
  interceptEmail,
  deleteEmail,
  assertUrlIncludes,
  createFakeUserDataArray
} from '@blockframes/testing/cypress/client';
import { capitalize } from '@blockframes/utils/helpers';
import { Organization } from '@blockframes/model';
import { orgActivity, territories } from '@blockframes/utils/static-model/static-model';

const [newOrgUser, knownMarketplaceOrgUser, knownDashboardOrgUser] = createFakeUserDataArray(3);

describe('Signup', () => {

  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    cy.visit('auth/identity');
  });

  it('User from new company can signup', () => {
    const user = newOrgUser;
    get('cookies').click();
    get('email').type(user.email);
    get('first-name').type(user.firstname);
    get('last-name').type(user.lastname);
    get('org').type(user.company.name);
    get('new-org').click();
    get('activity').click();
    getInList('activity_', user.company.activity);
    get('activity').should('contain', user.company.activity);
    get('country').click();
    getInList('country_', user.company.country);
    get('country').should('contain', user.company.country);
    get('role').contains(user.role).click();
    get('password').type(user.password);
    get('password-confirm').type(user.password);
    check('terms');
    check('gdpr');
    get('submit').click();
    interceptEmail({ sentTo: user.email })
      .then((mail) => deleteEmail(mail.id));
    interceptEmail({ subject: `Archipel Market - ${user.company.name} was created and needs a review` })
      .then((mail) => deleteEmail(mail.id));
    interceptEmail({ body: `${user.email}` })
      .then((mail) => deleteEmail(mail.id));
    cy.log('all mails received');
    assertUrl('c/organization/create-congratulations');
    get('profile-data-ok').should('exist');
    get('org-data-ok').should('exist');
    get('email-pending').should('exist');
    get('org-approval-pending').should('exist');
    cy.log('waiting for user confirmation and organisation approval');
    cy.task('validateOrg', user.company.name)
      .then(() => cy.log('Org validated'));
    get('org-approval-ok').should('exist');
    cy.task('validateAuthUser', user.email)
      .then(() => cy.log('User validated'));
    get('email-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    get('skip-preferences').click();
  });

  it('User from a known organization with access to festival marketplace can signup', () => {
    const user = knownMarketplaceOrgUser;
    cy.task('getRandomOrg', { app: 'festival', access: { marketplace: true, dashboard: false } })
      .then((org: Organization) => {
        get('cookies').click();
        get('email').type(user.email);
        get('first-name').type(user.firstname);
        get('last-name').type(user.lastname);
        get('org').type(org.denomination.full);
        getInList('org_', org.denomination.full);
        get('activity').should('contain', orgActivity[org.activity]);
        get('country').should('contain', capitalize(territories[org.addresses.main.country]));
        get('password').type(user.password);
        get('password-confirm').type(user.password);
        check('terms');
        check('gdpr');
        get('submit').click();
        interceptEmail({ sentTo: user.email })
          .then((mail) => deleteEmail(mail.id));
        interceptEmail({ body: `${user.email}` })
          .then((mail) => deleteEmail(mail.id));
        cy.log('all mails received');
        assertUrl('c/organization/join-congratulations');
        get('profile-data-ok').should('exist');
        get('org-data-ok').should('exist');
        get('email-pending').should('exist');
        get('org-approval-pending').should('exist');
        cy.log('waiting for user confirmation and organisation approval');
        cy.task('validateAuthUser', user.email)
          .then(() => cy.log('User validated'));
        get('email-ok').should('exist');
        cy.task('acceptUserInOrg', user.email)
          .then(() => cy.log('User accepted in org'));
        get('org-approval-ok').should('exist');
        get('refresh').click();
        assertUrlIncludes('c/o/marketplace/home');
        get('skip-preferences').click();

        //TODO: connect with an admin of this org to check if the notification has been received - issue #7751
      }
    );
  });

  it('User from a known organization with access to festival dashboard can signup', () => {
    const user = knownDashboardOrgUser;
    cy.task('getRandomOrg', { app: 'festival', access: { marketplace: true, dashboard: true } })
      .then((org: Organization) => {
        get('cookies').click();
        get('email').type(user.email);
        get('first-name').type(user.firstname);
        get('last-name').type(user.lastname);
        get('org').type(org.denomination.full);
        getInList('org_', org.denomination.full);
        get('activity').should('contain', orgActivity[org.activity]);
        get('country').should('contain', capitalize(territories[org.addresses.main.country]));
        get('password').type(user.password);
        get('password-confirm').type(user.password);
        check('terms');
        check('gdpr');
        get('submit').click();
        interceptEmail({ sentTo: user.email })
          .then((mail) => deleteEmail(mail.id));
        interceptEmail({ body: `${user.email}` })
          .then((mail) => deleteEmail(mail.id));
        cy.log('all mails received');
        assertUrl('c/organization/join-congratulations');
        get('profile-data-ok').should('exist');
        get('org-data-ok').should('exist');
        get('email-pending').should('exist');
        get('org-approval-pending').should('exist');
        cy.log('waiting for user confirmation and organisation approval');
        cy.task('validateAuthUser', user.email)
          .then(() => cy.log('User validated'));
        get('email-ok').should('exist');
        cy.task('acceptUserInOrg', user.email)
          .then(() => cy.log('User accepted in org'));
        get('org-approval-ok').should('exist');
        get('refresh').click();
        assertUrlIncludes('c/o/dashboard/home');

        //TODO: connect with an admin of this org to check if the notification has been received - issue #7751
      }
    );
  });

  //TODO : code other possibilities - issue #7751
  // try to signup with a known mail => fail
  // try not to fill each input alternatively => fail
  // try to fill input with wrong values => fail (ex : mail with é or ç, short password, no matching password, etc...)
});
