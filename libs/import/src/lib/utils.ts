import { Movie, MovieService } from "@blockframes/movie/+state";
import { Mandate, Sale } from "@blockframes/contract/contract/+state/contract.model";
import { Organization, OrganizationService } from "@blockframes/organization/+state";
import { User } from "@blockframes/user/+state/user.model";
import { Term } from "@blockframes/contract/term/+state/term.model";
import { SheetTab, ValueWithError } from "@blockframes/utils/spreadsheet";
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


/**
 * This hold the excel line number where the data start.
 * It should always match the column names line in the excel files.
 * The org/titles/contract should then be directly under this line.
 */
export const sheetHeaderLine: Record<SpreadsheetImportType, number> = {
  titles: 14,
  contracts: 10,
  organizations: 10,
};

export const sheetRanges: Record<SpreadsheetImportType, string> = {
  titles: `A${sheetHeaderLine.titles}:BZ1000`,
  contracts: `A${sheetHeaderLine.contracts}:Q100`,
  organizations: `A${sheetHeaderLine.organizations}:Z100`,
};


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
  if (user) cache[user.uid] = user;
  return user;
}

export function getDate(value: string, name: string): Date | ValueWithError<Date> {

  let date = new Date(value);

  // some time excel might store the date as a the number of DAYS since 1900/1/1
  // so 1 = 1900/1/1   and   42396 = 2016/1/27
  // if we leave the date like that and we do `new Date('42396')` we will get 42396/1/1
  // This will break firestore (Timestamp seconds out of range error)
  // If the value can be parsed as a number, we should expect excel format and convert it into a correct js date
  // In Excel format the unix epoch 1970/1/1 is encoded as 25569

  // (╯°□°)╯︵ ┻━┻

  const isExcelDate = !isNaN(Number(value));
  if (isExcelDate) {
    const excelNumberOfDays = Number(value);
    const unixNumberOfDays = 25_569;
    const millisecondsInOneDay = 24 * 60 * 60 * 1000;
    date = new Date( (excelNumberOfDays - unixNumberOfDays) * millisecondsInOneDay );
  }

  if (isNaN(date.getTime())) return wrongValueError(name);

  // if date seems strange we throw an Error
  const year = date.getFullYear();
  if (year < 1895 || year > 2200) {
    return {
      value: undefined,
      error: {
        type: 'error',
        name: `Invalid ${name}`,
        reason: 'The date seems too far away in the past or in the future.',
        hint: 'Date must be between 1895 and 2200, if the date seems to be correct please check that Excel format the cell as a Date.'
      }
    };
  }
  return date;
}


export function mandatoryError<T = unknown>(name: string): ValueWithError<T> {
  return {
    value: undefined,
    error: {
      type: 'error',
      name: `Missing ${name}`,
      reason: 'Mandatory field is missing.',
      hint: 'Please fill in the corresponding sheet field.'
    },
  };
}


export function unknownEntityError<T = unknown>(name: string): ValueWithError<T> {
  return {
    value: undefined,
    error: {
      type: 'error',
      name: `Unknown ${name}`,
      reason: `${name} should exist in the app but we couldn't find it.`,
      hint: `Please check the corresponding sheet field for mistake, create the corresponding ${name} if you can, or contact us.`
    },
  };
}


export function wrongValueError<T = unknown>(name: string): ValueWithError<T> {
  return {
    value: undefined,
    error: {
      type: 'error',
      name: `Wrong ${name}`,
      reason: `${name} should be a value of the given list.`,
      hint: `Please check the corresponding sheet field for mistakes, be sure to select a value form the list.`
    },
  };
}


export function alreadyExistError<T = unknown>(name: string): ValueWithError<T> {
  return {
    value: undefined,
    error: {
      type: 'error',
      name: `${name} already exist`,
      reason: `We could not create a this ${name} because it already exist on the app.`,
      hint: `Please edit the corresponding sheet field with a different value.`
    },
  };
}

export function optionalWarning<T = unknown>(name: string, value?: T): ValueWithError<T> {
  return {
    // value is `undefined` by default because optional warning mean that the value is missing,
    // for other warning the value should passed as a parameter
    value,
    error: {
      type: 'warning',
      name: `Missing ${name}`,
      reason: 'Optional field is missing.',
      hint: 'Fill in the corresponding sheet field to add a value.'
    }
  };
}

export function adminOnlyWarning<T = unknown>(value: T, name: string): ValueWithError<T> {
  return {
    value,
    error: {
      type: 'warning',
      name: `${name} is only for Admins`,
      reason: 'This field is reserved for admins, it\'s value will be omitted.',
      hint: 'Remove the corresponding sheet field to silence this warning.'
    }
  };
}
