import { StakeholderDocument } from "./stakeholder.firestore";
import { Organization } from "@blockframes/organization/+state/organization.model";

export interface Stakeholder extends StakeholderDocument {  // ce stakeholder doit heriter de StakeHolder de draw.io => renommer en stakeholderDelivery?
  organization: Organization;
}
