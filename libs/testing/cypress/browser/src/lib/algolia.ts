import { Organization } from '@blockframes/model';

export const algolia = {
  storeOrganization(org: Organization) {
    return cy.task('storeOrganization', org);
  }
}
