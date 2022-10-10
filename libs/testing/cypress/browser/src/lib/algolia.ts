import { Organization, Movie } from '@blockframes/model';

export const algolia = {
  storeOrganization(org: Organization) {
    return cy.task('storeOrganization', org);
  },

  storeMovie(data: { movie: Movie; organizationNames: string[] }) {
    return cy.task('storeMovie', data);
  },

  delete(docId: string) {
    return cy.task('algoliaDelete', docId);
  },
};
