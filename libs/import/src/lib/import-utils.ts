import { Movie } from "@blockframes/movie/+state";
import { Contract } from "@blockframes/contract/contract/+state/contract.model";
import { DistributionRight } from "@blockframes/distribution-rights/+state/distribution-right.model";
import { Organization } from "@blockframes/organization/+state";
import { User } from "@blockframes/user/+state/user.model";

export interface SpreadsheetImportError {
  field: string;
  name: string;
  reason: string;
  type: 'error' | 'warning';
  hint?: string;
}

export interface MovieImportState {
  movie: Movie;
  distributionRights?: DistributionRight[];
  errors?: SpreadsheetImportError[];
}

export interface ContractsImportState {
  errors?: SpreadsheetImportError[];
  newContract: boolean;
  contract: Contract;
}

export interface OrganizationsImportState {
  errors?: SpreadsheetImportError[];
  org: Organization;
  superAdmin: User;
  newOrg: boolean;
}
