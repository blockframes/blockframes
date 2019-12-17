import { StakeholderRaw } from "@blockframes/utils/common-interfaces/identity";

/** Stakeholder model as it appears in Firestore. */
export interface StakeholderDocument extends StakeholderRaw {
  orgId: string;
  isAccepted: boolean;
  processedId?: string;
}

/** A factory function that create a stakeholder. */
export function createDeliveryStakeholder(params: Partial<StakeholderDocument> = {}): StakeholderDocument {
  return {
    orgId: '',
    isAccepted: false,
    ...params,
  }
}
