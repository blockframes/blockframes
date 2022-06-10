import { OrganizationDocument } from '@blockframes/model';

export const algolia = {
  storeOrganization(org: OrganizationDocument) {
    return cy.task('storeOrganization', org);
  }
}
