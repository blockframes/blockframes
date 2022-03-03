import { centralOrgId } from "@env";
import { Contract } from "./contract.firestore";

export function getSeller(contract: Contract) {
  const sellerId = contract.stakeholders.find(stakeholder => {
    stakeholder !== contract.buyerId && stakeholder !== centralOrgId.catalog
  });
  return sellerId ?? contract.sellerId;
}
