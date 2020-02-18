import { StakeholderDocument } from "./stakeholder.firestore";
import { PublicOrganization } from "@blockframes/organization/+state/organization.firestore";

export interface Stakeholder extends StakeholderDocument {
  organization: PublicOrganization;
}
