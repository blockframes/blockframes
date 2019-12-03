import { OrganizationMember } from "@blockframes/organization/member/+state/member.model";


export interface DaoOperation {
  id: string;
  name: string;
  quorum: number;
  members: OrganizationMember[];
}

export interface DaoAction {
  id: string;
  opId: string;
  name: string;
  signers: OrganizationMember[];
  isApproved: boolean;
  approvalDate?: string;
}

export interface Dao {
  id: string;
  name: string;
  /** Represent the rules of possible actions on the blockchain */
  operations?: DaoOperation[];
  /** Possible actions on the blockchain (example: sign a specific delivery) */
  actions?: DaoAction[];
  /** Is the smart contract of organization being deploy or not */
  isDeploying?: boolean;
  /** The current step of the status of the smart contract of organization */
  deployStep?: DeploySteps;
}

export const enum DeploySteps { notDeployed, registered, resolved, ready };

/** A factory function that creates an Organization. */
export function createDao(
  params: Partial<Dao> = {}
): Dao {
  return {

    id: '',
    name: '',
    actions: params.actions || [],
    operations: params.operations || [],
    isDeploying: params.isDeploying || false,
    deployStep: params.deployStep || DeploySteps.notDeployed
  }
}

export function createOperation(id: string, name: string): DaoOperation {
  return {
    id,
    name,
    quorum: 0,
    members: []
  };
}
