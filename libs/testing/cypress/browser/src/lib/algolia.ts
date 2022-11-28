import { Organization, Movie, App } from '@blockframes/model';

export const algolia = {
  storeOrganization(org: Organization) {
    return cy.task('storeOrganization', org);
  },

  storeMovie(data: { movie: Movie; organizationNames: string[] }) {
    return cy.task('storeMovie', data);
  },

  deleteMovie(data: { app: Exclude<App, 'crm'>; objectId: string }) {
    return cy.task('deleteAlgoliaMovie', data);
  },

  deleteOrg(data: { app: Exclude<App, 'crm'>; objectId: string }) {
    return cy.task('deleteAlgoliaOrg', data);
  },

  clearTestData() {
    return cy.task('clearAlgoliaTestData');
  },
};
