/** Stakeholder model as it appears in Firestore. */
export interface StakeholderDocument { // @todo #1061 update (@see movie.firestore.ts)
  orgId: string;
  isAccepted: boolean;
  processedId?: string;
}

/** A factory function that create a stakeholder. */
export function createStakeholder(params: Partial<StakeholderDocument> = {}): StakeholderDocument { // @todo #1061 rename
  return {
    orgId: '',
    isAccepted: false,
    ...params,
  }
}
