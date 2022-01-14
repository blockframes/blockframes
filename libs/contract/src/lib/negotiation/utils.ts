import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";
import { centralOrgId } from "@env";
import { Negotiation } from "./+state/negotiation.firestore";

export function isInitial(negotiation: Partial<Negotiation>) {
  if (!negotiation?._meta) return true;
  const initial = negotiation.initial
  const createdAt = negotiation._meta?.createdAt
  initial?.setSeconds(0, 0);
  createdAt?.setSeconds(0, 0);

  return initial?.getTime() === createdAt?.getTime();
}

export function getRecipient(negotiation: Negotiation<Timestamp | Date>) {
  return negotiation.stakeholders.find(id => id !== negotiation.createdByOrg && id !== centralOrgId.catalog);
}
