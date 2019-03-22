export interface Stakeholder {
  id: string;
  orgId: string;
  job: string;
  role: string;
  authorization: string;
}

export function createStakeholder(params?: Partial<Stakeholder>) {
  return params ? {
    id: params.id || '',
    orgId: params.orgId,
    job: params.job,
    role: params.role,
    authorization: params.authorization,
  } : {} as Stakeholder;
}
