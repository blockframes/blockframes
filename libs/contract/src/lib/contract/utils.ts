import { Contract } from "@blockframes/model";
import { centralOrgId } from "@env";

export function getSeller(contract: Contract) {
  const sellerId = contract.stakeholders.find(stakeholder => {
    return stakeholder !== contract.buyerId && stakeholder !== centralOrgId.catalog;
  });
  return sellerId ?? contract.sellerId;
}
