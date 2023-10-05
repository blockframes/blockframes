import { centralOrgId } from '@env';
import { Negotiation } from '@blockframes/model';

export function getReviewer(negotiation: Negotiation) {
  return negotiation.stakeholders.find(
    (id) => id !== negotiation.createdByOrg && id !== centralOrgId.catalog
  );
}
