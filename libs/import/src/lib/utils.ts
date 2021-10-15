import { Movie } from "@blockframes/movie/+state";
import { Mandate, Sale } from "@blockframes/contract/contract/+state/contract.model";
import { Organization } from "@blockframes/organization/+state";
import { User } from "@blockframes/user/+state/user.model";
import { Term } from "@blockframes/contract/term/+state/term.model";
import { SheetTab } from "@blockframes/utils/spreadsheet";


export const spreadsheetImportTypes = [ 'titles', 'organizations', 'contracts' ] as const;

export type SpreadsheetImportType = typeof spreadsheetImportTypes[number];

export interface SpreadsheetImportEvent {
  sheet: SheetTab,
  importType: SpreadsheetImportType,
}

export interface SpreadsheetImportError {
  field: string;
  name: string;
  reason: string;
  type: 'error' | 'warning';
  hint?: string;
}

export interface MovieImportState {
  movie: Movie;
  errors?: SpreadsheetImportError[];
}

export interface ContractsImportState {
  errors?: SpreadsheetImportError[];
  newContract: boolean;
  contract: Sale | Mandate;
  terms: Term<Date>[]
}

export interface OrganizationsImportState {
  errors?: SpreadsheetImportError[];
  org: Organization;
  superAdmin: User;
  newOrg: boolean;
}


export const sheetRanges: Record<SpreadsheetImportType, string> = {
  titles: 'A14:BZ1000',
  contracts: 'A1:Q100',
  organizations: 'A10:Z100',
}
