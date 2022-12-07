import { Organization, Movie, App } from '@blockframes/model';

export const algolia = {
  storeOrganization(org: Organization) {
    return cy.task('storeOrganization', org);
  },

  storeMovie(data: { movie: Movie; organizationNames: string[] }) {
    return cy.task('storeMovie', data);
  },

  clearTestData(apps: Exclude<App, 'crm' | 'financiers'> | Exclude<App, 'crm' | 'financiers'>[]) {
    if (!Array.isArray(apps)) apps = [apps];
    cy.task('clearAlgoliaTestData', apps);
    return cy.wait(10000); //giving some time to algolia to delete all
  },
};
