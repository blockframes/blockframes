import { Movie, MovieService } from "@blockframes/movie/+state";
import { Mandate, Sale } from "@blockframes/contract/contract/+state/contract.model";
import { Organization, OrganizationService } from "@blockframes/organization/+state";
import { User } from "@blockframes/user/+state/user.model";
import { Term } from "@blockframes/contract/term/+state/term.model";
import { SheetTab } from "@blockframes/utils/spreadsheet";
import { centralOrgId } from "@env";
import { ContractService } from "@blockframes/contract/contract/+state/contract.service";
import { UserService } from "@blockframes/user/+state";


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


export async function getOrgId(name: string, orgService: OrganizationService, cache: Record<string, string>) {
  if (!name) return '';
  if (name === 'Archipel Content') return centralOrgId.catalog;

  if (cache[name]) return cache[name];

  const orgs = await orgService.getValue(ref => ref.where('denomination.full', '==', name));
  const result = orgs.length === 1 ? orgs[0].id : '';
  cache[name] = result;
  return result;
}

export async function getTitleId(name: string, titleService: MovieService, cache: Record<string, string>, userOrgId: string, blockframesAdmin: boolean) {
  if (!name) return '';
  if (cache[name]) return cache[name];

  const titles = await titleService.getValue(ref => {
    if (blockframesAdmin) {
      return ref.where('title.international', '==', name);
    } else {
      return ref.where('title.international', '==', name)
        .where('orgIds', 'array-contains', userOrgId);
    }
  });
  const result =  titles.length === 1 ? titles[0].id : '';
  cache[name] = result;
  return result;
}

export async function getContract(id: string, contractService: ContractService, cache: Record<string, (Mandate | Sale)>) {
  if (!id) return;

  if (cache[id]) return cache[id];

  const contract = await contractService.getValue(id);
  cache[id] = contract;
  return contract;
}


export async function getUserId(email: string, userService: UserService, cache: Record<string, string>) {
  if (!email) return '';
  if (cache[email]) return cache[email];

  const user = await userService.getValue(ref => ref.where('email', '==', email));
  const result =  user.length === 1 ? user[0].email : '';
  cache[email] = result;
  return result;
}
