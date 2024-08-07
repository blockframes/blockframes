import {
  user,
  org,
  orgPermissions,
  acceptedBuyerOrg,
  dashboardBuyerOrg,
  pendingBuyerOrg,
  catalogBuyerOrg,
  orgNamePrefix,
  anotherAcceptedBuyerOrg,
} from '../../../fixtures/dashboard/search-organization';
import {
  // plugins
  adminAuth,
  algolia,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  assertUrlIncludes,
  get,
  //marketplace lib
  selectFilter,
} from '@blockframes/testing/cypress/browser';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`orgs/${acceptedBuyerOrg.id}`]: acceptedBuyerOrg,
  [`orgs/${anotherAcceptedBuyerOrg.id}`]: anotherAcceptedBuyerOrg,
  [`orgs/${dashboardBuyerOrg.id}`]: dashboardBuyerOrg,
  [`orgs/${pendingBuyerOrg.id}`]: pendingBuyerOrg,
  [`orgs/${catalogBuyerOrg.id}`]: catalogBuyerOrg,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
};

describe('Search buyer organizations in dashboard', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    algolia.deleteOrg({ app: 'festival', objectId: acceptedBuyerOrg.id });
    algolia.deleteOrg({ app: 'festival', objectId: anotherAcceptedBuyerOrg.id });
    algolia.deleteOrg({ app: 'festival', objectId: dashboardBuyerOrg.id });
    algolia.deleteOrg({ app: 'festival', objectId: pendingBuyerOrg.id });
    algolia.deleteOrg({ app: 'festival', objectId: catalogBuyerOrg.id });
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('cookies').click();
    cy.visit('c/o/dashboard/home');
  });

  it('Only an accepted org, with access to festival marketplace and not dashboard should be visible', () => {
    algolia.storeOrganization(acceptedBuyerOrg);
    algolia.storeOrganization(anotherAcceptedBuyerOrg);
    algolia.storeOrganization(dashboardBuyerOrg);
    algolia.storeOrganization(pendingBuyerOrg);
    algolia.storeOrganization(catalogBuyerOrg);
    cy.wait(6000); // giving algolia some tome to catch up
    get('organization').click();
    assertUrlIncludes('c/o/dashboard/organization');
    get('organizations-count').then($result => {
      const orgsCount = $result[0].innerText;
      get('search-input').type(orgNamePrefix);
      get('organizations-count').should('not.contain', orgsCount);
      get('organizations-count').should('contain', 'There is 1 buyer available.');
      get(`item_${acceptedBuyerOrg.id}`).should('exist');
      get(`item_${dashboardBuyerOrg.id}`).should('not.exist');
      get(`item_${pendingBuyerOrg.id}`).should('not.exist');
      get(`item_${catalogBuyerOrg.id}`).should('not.exist');
    });
  });

  it('Filter works as expected', () => {
    algolia.storeOrganization(acceptedBuyerOrg);
    algolia.storeOrganization(anotherAcceptedBuyerOrg);
    cy.wait(6000); // giving algolia some tome to catch up
    get('organization').click();
    assertUrlIncludes('c/o/dashboard/organization');
    get('organizations-count').then($result => {
      const orgsCount = $result[0].innerText;
      get('search-input').type(orgNamePrefix);
      get('organizations-count').should('not.contain', orgsCount);
      get('organizations-count').should('contain', 'There is 1 buyer available.');
      get(`item_${acceptedBuyerOrg.id}`).should('exist');
    });
    selectFilter(`Company's Nationality`);
    // force click because the input is hidden by mat-label since angular 15 migration
    get('country').find('input').click({ force: true });
    get('option_kyrgyzstan').click();
    get('empty').should('exist');
    get('clear-filter').click();
    // force click because the input is hidden by mat-label since angular 15 migration
    get('country').find('input').click({ force: true });
    get(`option_${acceptedBuyerOrg.addresses.main.country}`).click();
    get('organizations-count').should('contain', 'There is 1 buyer available.');
  });
});
