import { algoliaSearchKeyDoc } from '@blockframes/utils/maintenance';
import {
  user,
  org,
  orgPermissions,
  acceptedSaleOrg,
  pendingSaleOrg,
  catalogSaleOrg,
  moviePermissions,
  movie,
  orgNamePrefix,
} from '../../fixtures/marketplace/search-organization';
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
  assertLocalStorage,
} from '@blockframes/testing/cypress/browser';
import { IAlgoliaKeyDoc } from '@blockframes/model';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`orgs/${acceptedSaleOrg.id}`]: acceptedSaleOrg,
  [`orgs/${pendingSaleOrg.id}`]: pendingSaleOrg,
  [`orgs/${catalogSaleOrg.id}`]: catalogSaleOrg,
  [`permissions/${orgPermissions.id}`]: orgPermissions,
  [`permissions/${orgPermissions.id}/documentPermissions/${moviePermissions.id}`]: moviePermissions,
  [`movies/${movie.id}`]: movie,
};

describe('Search sale organization in marketplace', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    algolia.deleteOrg({ app: 'festival', objectId: acceptedSaleOrg.id });
    algolia.deleteOrg({ app: 'festival', objectId: pendingSaleOrg.id });
    algolia.deleteOrg({ app: 'festival', objectId: catalogSaleOrg.id });
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('cookies').click();
    firestore.get(`${algoliaSearchKeyDoc}`).then((config: IAlgoliaKeyDoc) => {
      assertLocalStorage('algoliaSearchKey', config.key);
    });
    assertUrlIncludes('c/o/marketplace/home');
  });

  it('Only an accepted org, with access to festival marketplace should be visible', () => {
    algolia.storeOrganization(acceptedSaleOrg);
    algolia.storeOrganization(pendingSaleOrg);
    algolia.storeOrganization(catalogSaleOrg);
    cy.wait(2000); // giving algolia some tome to catch up
    get('Sales Agents').click();
    assertUrlIncludes('c/o/marketplace/organization');
    get('organizations-count').then($result => {
      const orgsCount = $result[0].innerText;
      get('search-input').type(orgNamePrefix);
      get('organizations-count').should('not.contain', orgsCount);
      get('organizations-count').should('contain', 'There is 1 seller available.');
      get(`org-card_${acceptedSaleOrg.id}`).should('exist');
      get(`org-card_${pendingSaleOrg.id}`).should('not.exist');
      get(`org-card_${catalogSaleOrg.id}`).should('not.exist');
    });
  });

  it('Filter works as expected', () => {
    algolia.storeOrganization(acceptedSaleOrg);
    cy.wait(2000);
    get('Sales Agents').click();
    assertUrlIncludes('c/o/marketplace/organization');
    get('organizations-count').then($result => {
      const orgsCount = $result[0].innerText;
      get('search-input').type(acceptedSaleOrg.name);
      get('organizations-count').should('not.contain', orgsCount);
      get('organizations-count').should('contain', 'There is 1 seller available.');
      get(`org-card_${acceptedSaleOrg.id}`).should('exist');
    });
    selectFilter(`Company's Nationality`);
    get('country').find('input').click();
    get('option_kyrgyzstan').click();
    get('empty').should('exist');
    get('clear-filter').click();
    get('country').find('input').click();
    get(`option_${acceptedSaleOrg.addresses.main.country}`).click();
    get('organizations-count').should('contain', 'There is 1 seller available.');
  });
});
