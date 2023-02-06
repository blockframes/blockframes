import { orgActivity, Organization, organizationStatus, territories, User } from '@blockframes/model';
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
import { admin, newcomers } from '../fixtures/create-org';

type OrgData = {
  app: string;
  access: string;
  status: string;
  data: {
    org: Organization;
    user: User;
  };
};

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

  for (const [status, appOrganizations] of Object.entries(newcomers)) {
    for (const [app, accesses] of Object.entries(appOrganizations)) {
      for (const [access, data] of Object.entries(accesses)) {
        if (!data) continue;
        it(`Create ${status} org on ${app} which can access ${access}`, () => {
          firestore.queryDeleteOrgsWithUsers({
            collection: 'orgs',
            field: 'addresses.main.street',
            operator: '==',
            value: data.org.addresses.main.street,
          });
          data.org.description = `E2E ${status} ${app} ${access} org`; // needs runtime to interpret
          const input = { app, access, status, data };
          createOrg(input);
          checkEmail(input);
          checkDbDocs(input);
          checkUI(input);
        });
      }
    }
  }
});

//* functions

function createOrg(input: OrgData) {
  const {
    app,
    access,
    status,
    data: { org, user },
  } = input;
  const fromApp = app === 'bothApps' ? 'festival' : app;
  const apps = app === 'bothApps' ? ['festival', 'catalog'] : [app];
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
  get(`option_${getKeyByValue(orgActivity, org.activity)}`).click();
  get('description').type(org.description);
  get('street').type(org.addresses.main.street);
  get('city').type(org.addresses.main.city);
  get('zip').type(org.addresses.main.zipCode);
  get('country').click();
  get(`option_${getKeyByValue(territories, org.addresses.main.country)}`).click();
  get('phone').type(org.addresses.main.phoneNumber);
  get('status').click();
  get(`option_${status}`).click();
  for (const a of apps) {
    if (access === 'marketplace' || access === 'bothAccess') get(`${a}-marketplace`).click();
    if (access === 'dashboard' || access === 'bothAccess') get(`${a}-dashboard`).click();
  }
  get('create').click();
}

function checkEmail(input: OrgData) {
  const {
    app,
    data: { org, user },
  } = input;
  return interceptEmail({ sentTo: user.email }).then(mail => {
    const fromApp = `Archipel ${app === 'festival' || app === 'bothApps' ? 'Market' : 'Content'}`;
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

function checkDbDocs(input: OrgData) {
  const {
    app,
    access,
    status,
    data: { org, user },
  } = input;
  // checking org
  firestore.queryData({ collection: 'orgs', field: 'name', operator: '==', value: org.name }).then((orgs: Organization[]) => {
    expect(orgs).to.have.lengthOf(1);
    const dbOrg = orgs[0];
    expect(dbOrg._meta.createdFrom).to.eq(app === 'bothApps' ? 'festival' : app);
    expect(dbOrg.activity).to.eq(getKeyByValue(orgActivity, org.activity));
    expect(dbOrg.addresses).to.deep.eq({
      main: {
        country: getKeyByValue(territories, org.addresses.main.country),
        region: '',
        city: org.addresses.main.city,
        zipCode: org.addresses.main.zipCode,
        street: org.addresses.main.street,
        phoneNumber: org.addresses.main.phoneNumber,
      },
    });
    const isFestivalApp = app === 'festival' || app === 'bothApps';
    const isCatalogApp = app === 'catalog' || app === 'bothApps';
    const hasMarketplaceAccess = access === 'marketplace' || access === 'bothAccess';
    const hasDashboardAccess = access === 'dashboard' || access === 'bothAccess';
    expect(dbOrg.appAccess).to.deep.eq({
      catalog: {
        dashboard: isCatalogApp && hasDashboardAccess,
        marketplace: isCatalogApp && hasMarketplaceAccess,
      },
      crm: {
        dashboard: false,
        marketplace: false,
      },
      festival: {
        dashboard: isFestivalApp && hasDashboardAccess,
        marketplace: isFestivalApp && hasMarketplaceAccess,
      },
      financiers: {
        dashboard: false,
        marketplace: false,
      },
    });
    expect(dbOrg.description).to.eq(org.description);
    expect(dbOrg.email).to.eq(org.email);
    expect(dbOrg.name).to.eq(org.name);
    expect(dbOrg.status).to.eq(status);
    // checking user
    firestore.get(`users/${dbOrg.userIds[0]}`).then((dbUser: User) => {
      expect(dbUser._meta.createdFrom).to.eq(app === 'bothApps' ? 'festival' : app);
      expect(dbUser._meta.emailVerified).to.be.true;
      expect(dbUser.email).to.eq(user.email);
      expect(dbUser.orgId).to.eq(dbOrg.id);
    });
  });
}

function checkUI(input: OrgData) {
  const {
    app,
    access,
    status,
    data: { org, user },
  } = input;
  // card
  get('header-name').should('contain', org.name);
  get('org-name').should('contain', org.name);
  get('org-street').should('contain', org.addresses.main.street);
  get('org-zip').should('contain', org.addresses.main.zipCode);
  get('org-city').should('contain', org.addresses.main.city);
  get('org-country').should('contain', getKeyByValue(territories, org.addresses.main.country));
  get('org-phone').should('contain', org.addresses.main.phoneNumber);
  get('org-email').should('contain', org.email);
  get('org-activity').should('contain', getKeyByValue(orgActivity, org.activity));
  // form
  get('name').invoke('val').should('contain', org.name);
  get('email').invoke('val').should('contain', org.email);
  get('activity').should('contain', org.activity);
  get('description').invoke('val').should('contain', org.description);
  get('street').invoke('val').should('contain', org.addresses.main.street);
  get('city').invoke('val').should('contain', org.addresses.main.city);
  get('zip').invoke('val').should('contain', org.addresses.main.zipCode);
  get('country').should('contain', org.addresses.main.country);
  get('phone').invoke('val').should('contain', org.addresses.main.phoneNumber);
  get('status').should('contain', organizationStatus[status]);
  const isFestivalApp = app === 'festival' || app === 'bothApps';
  const isCatalogApp = app === 'catalog' || app === 'bothApps';
  const hasMarketplaceAccess = access === 'marketplace' || access === 'bothAccess';
  const hasDashboardAccess = access === 'dashboard' || access === 'bothAccess';
  get('catalog-dashboard').should(isCatalogApp && hasDashboardAccess ? 'have.class' : 'not.have.class', 'mat-checkbox-checked');
  get('festival-dashboard').should(isFestivalApp && hasDashboardAccess ? 'have.class' : 'not.have.class', 'mat-checkbox-checked');
  get('catalog-marketplace').should(
    isCatalogApp && hasMarketplaceAccess ? 'have.class' : 'not.have.class',
    'mat-checkbox-checked'
  );
  get('festival-marketplace').should(
    isFestivalApp && hasMarketplaceAccess ? 'have.class' : 'not.have.class',
    'mat-checkbox-checked'
  );
  get('financiers-dashboard').should('not.have.class', 'mat-checkbox-checked');
  get('financiers-marketplace').should('not.have.class', 'mat-checkbox-checked');
  //table
  get('row_0_col_3').should('contain', user.email);
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
