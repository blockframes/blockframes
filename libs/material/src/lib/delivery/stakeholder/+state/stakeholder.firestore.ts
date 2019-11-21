/** Stakeholder model as it appears in Firestore. */
export interface StakeholderDocument {
  id: string;
  role: string
  isAccepted: boolean;
  processedId?: string;
}

/** A factory function that create a stakeholder. */
export function createStakeholder(params: Partial<StakeholderDocument> = {}): StakeholderDocument {
  return {
    id: '',
    role: '',
    isAccepted: false,
    ...params,
  }
}
