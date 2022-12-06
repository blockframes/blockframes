import { Organization, Movie } from '@blockframes/model';

export const algolia = {
  storeOrganization(org: Organization) {
    return cy.task('storeOrganization', org);
  },

  storeMovie(data: { movie: Movie; organizationNames: string[] }) {
    return cy.task('storeMovie', data);
  },

  clearTestData() {
    cy.task('clearAlgoliaTestData');
    return cy.wait(10000) //giving some time to algolia to delete all
  },
};
