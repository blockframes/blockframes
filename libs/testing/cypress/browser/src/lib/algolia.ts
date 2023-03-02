import { Organization, Movie, AlgoliaApp } from '@blockframes/model';

export const algolia = {
  storeOrganization(org: Organization) {
    return cy.task('storeOrganization', org);
  },

  storeMovie(data: { movie: Movie; orgs: Organization[] }) {
    return cy.task('storeMovie', data);
  },

  deleteMovie(data: { app: AlgoliaApp; objectId: string }) {
    return cy.task('deleteAlgoliaMovie', data);
  },

  deleteOrg(data: { app: AlgoliaApp; objectId: string }) {
    return cy.task('deleteAlgoliaOrg', data);
  },
};
