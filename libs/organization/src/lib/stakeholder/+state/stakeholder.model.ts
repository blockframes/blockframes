import { StakeholderDocument } from "./stakeholder.firestore";
import { Organization } from "../../+state";

export interface Stakeholder extends StakeholderDocument {
  organization: Organization;
}
