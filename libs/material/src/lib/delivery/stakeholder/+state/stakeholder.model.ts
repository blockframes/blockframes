import { StakeholderDocument } from "./stakeholder.firestore";
import { Organization } from "@blockframes/organization/+state/organization.model";

export interface Stakeholder extends StakeholderDocument {
  organization: Organization;
}
