import { centralOrgId } from '@env';
import { Negotiation,  } from '@blockframes/model';

export function isInitial(negotiation: Partial<Negotiation>) {
  if (!negotiation?._meta) return true;
  const initial = negotiation.initial;
  const createdAt = negotiation._meta?.createdAt;
  initial?.setSeconds(0, 0);
  createdAt?.setSeconds(0, 0);

  return initial?.getTime() === createdAt?.getTime();
}

export function getReviewer(negotiation: Negotiation) {
  return negotiation.stakeholders.find(
    (id) => id !== negotiation.createdByOrg && id !== centralOrgId.catalog
  );
}
