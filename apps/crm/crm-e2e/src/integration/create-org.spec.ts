import {
  App,
  canAccessModule,
  createModuleAccess,
  getOrgAppAccess,
  getOrgModuleAccess,
  orgActivity,
  Organization,
  organizationStatus,
  territories,
  User,
  Module,
} from '@blockframes/model';
import {
  // plugins
  adminAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  connectOtherUser,
  assertUrl,
  interceptEmail,
  deleteEmail,
} from '@blockframes/testing/cypress/browser';
import { admin, Newcomer, newcomers } from '../fixtures/create-org';

const injectedData = {
  [`users/${admin.user.uid}`]: admin.user,
  [`blockframesAdmin/${admin.user.uid}`]: {},
  [`orgs/${admin.org.id}`]: admin.org,
  [`permissions/${admin.permissions.id}`]: admin.permissions,
};

describe('Create organization', () => {
  before(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: admin.user.uid, email: admin.user.email, emailVerified: true });
    maintenance.end();
    cy.visit('');
    connectOtherUser(admin.user.email);
  });

  for (const newcomer of newcomers) {
    const { org } = newcomer;
    const apps = getOrgAppAccess(org);
    const modules = getOrgModuleAccess(org);
    it(`Create ${org.status} org on ${apps.join(' & ')} which can access ${modules.join(' & ')}`, () => {
      firestore.queryDeleteOrgsWithUsers({
        collection: 'orgs',
        field: 'addresses.main.street',
        operator: '==',
        value: org.addresses.main.street,
      });
      createOrg(newcomer);
      checkEmail(newcomer);
      checkDbDocs(newcomer);
      checkUI(newcomer);
    });
  }
});

//* functions

function createOrg(newcomer: Newcomer) {
  const { org, user } = newcomer;
  const apps = getOrgAppAccess(org);
  const fromApp = apps[0];
  get('orgs').click();
  assertUrl('c/o/dashboard/crm/organizations');
  get('create-org').click();
  get('creation-form').should('exist');
  get('super-admin-email').type(user.email);
  get('from-app').click();
  get(`option_${fromApp}`).click();
  get('name').type(org.name);
  get('email').type(`${org.email}`);
  get('activity').click();
  get(`option_${org.activity}`).click();
  get('description').type(org.description);
  get('street').type(org.addresses.main.street);
  get('city').type(org.addresses.main.city);
  get('zip').type(org.addresses.main.zipCode);
  get('country').click();
  get(`option_${org.addresses.main.country}`).click();
  get('phone').type(org.addresses.main.phoneNumber);
  get('status').click();
  get(`option_${org.status}`).click();
  for (const app of apps) {
    const modules = getOrgModuleAccess(org, app); // With app specified so we test modules access for specific app (even if fixtures does not allow different modules)
    for (const module of modules) {
      get(`${app}-${module}`).click();
    }
  }
  get('create').click();
}

function checkEmail(newcomer: Newcomer) {
  const { org, user } = newcomer;
  return interceptEmail({ sentTo: user.email }).then(mail => {
    const fromApp = `Archipel ${getOrgAppAccess(org).includes('festival') ? 'Market' : 'Content'}`;
    expect(mail.subject).to.eq(`You've been invited to join ${org.name} on ${fromApp}`);
    const activationLink = mail.html.links.filter(link => link.text === 'Activate Account')[0];
    cy.request({ url: activationLink.href, failOnStatusCode: false }).then(response => {
      expect(response.redirects).to.have.lengthOf(1);
      const redirect = response.redirects[0];
      expect(redirect).to.include('302');
      // 2 parts check because we cannnot retrieve the invitation code (which is the auth password)
      expect(redirect).to.include('auth/identity?code');
      expect(redirect).to.include(`&email=${user.email.replace('@', '%40')}`);
    });
    return deleteEmail(mail.id);
  });
}

function checkDbDocs(newcomer: Newcomer) {
  const { org, user } = newcomer;
  // checking org
  return firestore.queryData<Organization>({ collection: 'orgs', field: 'name', operator: '==', value: org.name }).then(orgs => {
    expect(orgs).to.have.lengthOf(1);
    const dbOrg = orgs[0];
    const fromApp = getOrgAppAccess(org).includes('festival') ? 'festival' : 'catalog';
    expect(dbOrg._meta.createdFrom).to.eq(fromApp);
    expect(dbOrg.activity).to.eq(org.activity);
    expect(dbOrg.addresses).to.deep.eq({
      main: {
        country: org.addresses.main.country,
        region: '',
        city: org.addresses.main.city,
        zipCode: org.addresses.main.zipCode,
        street: org.addresses.main.street,
        phoneNumber: org.addresses.main.phoneNumber,
      },
    });
    expect(dbOrg.appAccess).to.deep.eq({
      catalog: {
        dashboard: canAccessModule('dashboard', org, 'catalog'),
        marketplace: canAccessModule('marketplace', org, 'catalog'),
      },
      festival: {
        dashboard: canAccessModule('dashboard', org, 'festival'),
        marketplace: canAccessModule('marketplace', org, 'festival'),
      },
      crm: createModuleAccess(),
      financiers: createModuleAccess(),
    });
    expect(dbOrg.description).to.eq(org.description);
    expect(dbOrg.email).to.eq(org.email);
    expect(dbOrg.name).to.eq(org.name);
    expect(dbOrg.status).to.eq(org.status);
    // checking user
    firestore.get(`users/${dbOrg.userIds[0]}`).then((dbUser: User) => {
      expect(dbUser._meta.createdFrom).to.eq(fromApp);
      expect(dbUser._meta.emailVerified).to.be.true;
      expect(dbUser.email).to.eq(user.email);
      expect(dbUser.orgId).to.eq(dbOrg.id);
    });
  });
}

function checkUI(newcomer: Newcomer) {
  const { org, user } = newcomer;
  // card
  get('header-name').should('contain', org.name);
  get('org-name').should('contain', org.name);
  get('org-street').should('contain', org.addresses.main.street);
  get('org-zip').should('contain', org.addresses.main.zipCode);
  get('org-city').should('contain', org.addresses.main.city);
  get('org-country').should('contain', territories[org.addresses.main.country]);
  get('org-phone').should('contain', org.addresses.main.phoneNumber);
  get('org-email').should('contain', org.email);
  get('org-activity').should('contain', orgActivity[org.activity]);
  // form
  get('name').invoke('val').should('contain', org.name);
  get('email').invoke('val').should('contain', org.email);
  get('activity').should('contain', orgActivity[org.activity]);
  get('description').invoke('val').should('contain', org.description);
  get('street').invoke('val').should('contain', org.addresses.main.street);
  get('city').invoke('val').should('contain', org.addresses.main.city);
  get('zip').invoke('val').should('contain', org.addresses.main.zipCode);
  get('country').should('contain', territories[org.addresses.main.country]);
  get('phone').invoke('val').should('contain', org.addresses.main.phoneNumber);
  get('status').should('contain', organizationStatus[org.status]);
  assertCheckbox('catalog', 'dashboard', org);
  assertCheckbox('festival', 'dashboard', org);
  assertCheckbox('catalog', 'marketplace', org);
  assertCheckbox('catalog', 'marketplace', org);
  get('financiers-dashboard').should('not.have.class', 'mat-checkbox-checked');
  get('financiers-marketplace').should('not.have.class', 'mat-checkbox-checked');
  //table
  get('row_0_col_3').should('contain', user.email);
}

function assertCheckbox(app: Exclude<App, 'crm' | 'financiers'>, module: Module, org: Organization) {
  return get(`${app}-${module}`).should(
    canAccessModule(module, org, app) ? 'have.class' : 'not.have.class',
    'mat-checkbox-checked'
  );
}
