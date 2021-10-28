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

export async function checkParentTerm(id: string, contractService: ContractService, cache: Record<string, (Mandate | Sale)>) {
  if (!id) return undefined;

  for (const contractId in cache) {
    const isMandate = cache[contractId].type === 'mandate';
    const containTerm = cache[contractId].termIds.includes(id);
    if (isMandate && containTerm) return cache[id] as Mandate;
  }

  const [ contract ] = await contractService.getValue(ref =>
    ref.where('type', '==', 'mandate').where('termIds', 'array-contains', id)
  );
  cache[contract.id] = contract;
  return contract as Mandate;
}


export async function getUser({ email }: { email: string }, userService: UserService, cache: Record<string, User>): Promise<User>;
export async function getUser({ id }: { id: string }, userService: UserService, cache: Record<string, User>): Promise<User>;
export async function getUser(query: { email: string } | { id: string }, userService: UserService, cache: Record<string, User>) {
  if (!query) return undefined;

  let user: User;
  if ('email' in query) {
    for (const id in cache) {
      if (cache[id].email === query.email) return cache[id];
    }

    user = await userService.getValue(ref => ref.where('email', '==', query.email)).then(u => u[0]);
  }

  if  ('id' in query) {
    if (cache[query.id]) return cache[query.id];

    user = await userService.getValue(query.id);
  }
  cache[user.uid] = user;
  return user;
}

export function getDate(value: string, errorData: { field: string, name: string }) {
  const date = new Date(value);
  if (isNaN(date.getTime())) throw new WrongValueError(errorData);
  return date;
}

export class MandatoryError extends Error {
  constructor({ field, name }: { field: string, name: string }) {
    super(JSON.stringify({
      type: 'error',
      field,
      name: `Missing ${name}`,
      reason: 'Mandatory field is missing.',
      hint: 'Please fill in the corresponding sheet field.'
    }));
  }
}

export class UnknownEntityError extends Error {
  constructor({ field, name }: { field: string, name: string }) {
    super(JSON.stringify({
      type: 'error',
      field,
      name: `Unknown ${name}`,
      reason: `${name} should exist in the app but we couldn't find it.`,
      hint: `Please check the corresponding sheet field for mistake, create the corresponding ${name} if you can, or contact us.`
    }));
  }
}

export class WrongValueError extends Error {
  constructor({ field, name }: { field: string, name: string }) {
    super(JSON.stringify({
      type: 'error',
      field,
      name: `Wrong ${name}`,
      reason: `${name} should be a value of the given list.`,
      hint: `Please check the corresponding sheet field for mistakes, be sure to select a value form the list.`
    }));
  }
}

export class AlreadyExistError extends Error {
  constructor({ field, name }: { field: string, name: string }) {
    super(JSON.stringify({
      type: 'error',
      field,
      name: `${name} already exist`,
      reason: `We could not create a this ${name} because it already exist on the app.`,
      hint: `Please edit the corresponding sheet field with a different value.`
    }));
  }
}

export function optionalWarning({ field, name }: { field: string, name: string }): SpreadsheetImportError {
  return {
    type: 'warning',
    field,
    name: `Missing ${name}`,
    reason: 'Optional field is missing.',
    hint: 'Fill in the corresponding sheet field to add a value.'
  };
}

export function adminOnlyWarning({ field, name }: { field: string, name: string }): SpreadsheetImportError {
  return {
    type: 'warning',
    field,
    name: `${name} is only for Admins`,
    reason: 'This field is reserved for admins, it\'s value will be omitted.',
    hint: 'Remove the corresponding sheet field to silence this warning.'
  };
}
