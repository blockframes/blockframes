import { MovieService } from '@blockframes/movie/+state/movie.service';
import { Movie, Organization, User, Mandate, Sale, Term } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { SheetTab, ValueWithError, ValueWithErrorSimple } from '@blockframes/utils/spreadsheet';
import { centralOrgId } from '@env';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { UserService } from '@blockframes/user/+state';
import { where } from 'firebase/firestore';

export const spreadsheetImportTypes = ['titles', 'organizations', 'contracts'] as const;

export type SpreadsheetImportType = typeof spreadsheetImportTypes[number];

export interface SpreadsheetImportEvent {
  sheet: SheetTab;
  importType: SpreadsheetImportType;
}

export interface SpreadsheetImportError {
  name: string;
  reason: string;
  type: 'error' | 'warning';
  field?: string;
  message?: string;
}

export interface MovieImportState {
  movie: Movie;
  errors?: SpreadsheetImportError[];
}

export interface ContractsImportState {
  errors?: SpreadsheetImportError[];
  newContract: boolean;
  contract: Sale | Mandate;
  terms: Term<Date>[];
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

export async function getOrgId(
  name: string,
  orgService: OrganizationService,
  cache: Record<string, string>
) {
  if (!name) return '';
  if (name === 'Archipel Content') return centralOrgId.catalog;

  if (cache[name]) return cache[name];

  const orgs = await orgService.getValue([where('denomination.full', '==', name)]);
  const result = orgs.length === 1 ? orgs[0].id : '';
  cache[name] = result;
  return result;
}

export async function getTitleId(
  nameOrId: string,
  titleService: MovieService,
  cache: Record<string, Movie>,
  userOrgId: string,
  isBlockframesAdmin: boolean
) {

  const memo = (key: string, value: Movie) => {
    cache[key] = value;
    return value.id
  }

  if (cache[nameOrId]) return cache[nameOrId].id;
  const title = await titleService.getValue(nameOrId);
  // Try if nameOrId is an id
  if (title) {
    if (isBlockframesAdmin) return memo(nameOrId, title);
    if (title.orgIds.includes(userOrgId)) return memo(nameOrId, title);
    throw new Error(`You don't have access to title with id: ${nameOrId}`);
  }
  // nameOrId is the international title name
  const queryFn = isBlockframesAdmin
    ? [where('title.international', '==', nameOrId)]
    : [where('title.international', '==', nameOrId), where('orgIds', 'array-contains', userOrgId)];
  const titles = await titleService.getValue(queryFn);
  if (!titles.length) throw new Error(`No title found with name/id "${nameOrId}".`);
  if (titles.length !== 1) throw new Error(`Multiple titles with name "${nameOrId}" found.`);
  return memo(nameOrId, titles[0]);
}

export async function getContract(
  id: string,
  contractService: ContractService,
  cache: Record<string, Mandate | Sale>
) {
  if (!id) return;

  if (cache[id]) return cache[id];

  const contract = await contractService.getValue(id);
  cache[id] = contract;
  return contract;
}

export async function checkParentTerm(
  id: string,
  contractService: ContractService,
  cache: Record<string, Mandate | Sale>
) {
  if (!id) return undefined;

  for (const contractId in cache) {
    const isMandate = cache[contractId].type === 'mandate';
    const containTerm = cache[contractId].termIds.includes(id);
    if (isMandate && containTerm) return cache[id] as Mandate;
  }

  const [contract] = await contractService.getValue([
    where('type', '==', 'mandate'),
    where('termIds', 'array-contains', id)
  ]);
  cache[contract.id] = contract;
  return contract as Mandate;
}

export async function getUser(
  { email }: { email: string },
  userService: UserService,
  cache: Record<string, User>
): Promise<User>;
export async function getUser(
  { id }: { id: string },
  userService: UserService,
  cache: Record<string, User>
): Promise<User>;
export async function getUser(
  query: { email: string } | { id: string },
  userService: UserService,
  cache: Record<string, User>
) {
  if (!query) return undefined;

  let user: User;
  if ('email' in query) {
    for (const id in cache) {
      if (cache[id].email === query.email) return cache[id];
    }

    user = await userService
      .getValue([where('email', '==', query.email)])
      .then((u) => u[0]);
  }

  if ('id' in query) {
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
    date = new Date((excelNumberOfDays - unixNumberOfDays) * millisecondsInOneDay);
  }

  if (isNaN(date.getTime())) throw wrongValueError(name);

  // if date seems strange we throw an Error
  const year = date.getFullYear();
  if (year < 1895 || year > 2200) {
    return {
      value: undefined,
      error: {
        type: 'error',
        name: `Invalid ${name}`,
        reason: 'The date seems too far away in the past or in the future.',
        message:
          'Date must be between 1895 and 2200, if the date seems to be correct please check that Excel format the cell as a Date.',
      },
    };
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export function mandatoryError<T = unknown>(name: string): BaseImportError<T> {
  const option: BaseImportError<T> = {
    value: undefined,
    name: `Missing ${name}`,
    reason: 'Mandatory field is missing.',
    message: 'Please fill in the corresponding sheet field.',
  };
  return ImportError.newError(option);
}

export function unknownEntityError<T = unknown>(name: string): BaseImportError<T> {
  const option:BaseImportError<T>= {
    value: undefined,
    name: `Unknown ${name}`,
    reason: `${name} should exist in the app but we couldn't find it.`,
    message: `Please check the corresponding sheet field for mistake, create the corresponding ${name} if you can, or contact us.`,
  };
  return ImportError.newError(option);
}

export function wrongValueError<T = unknown>(name: string): BaseImportError<T> {
  const option: BaseImportError<T> = {
    value: undefined,
    name: `Wrong ${name}`,
    reason: `${name} should be a value of the given list.`,
    message: `Please check the corresponding sheet field for mistakes, be sure to select a value form the list.`,
  };
  return ImportError.newError(option);
}

export function unusedMandateIdWarning<T extends string>(value: T): BaseImportError<T> {
  const option: BaseImportError<T> = {
    value,
    field: 'parentTerm',
    name: 'Unused Mandate ID/Row',
    reason:
      'Mandate ID is used only for sales contracts, here the value will be omitted because the contract is a mandate.',
    message: 'Remove the corresponding sheet field to silence this warning.',
  };
  return ImportError.newWarning(option);
}

export function alreadyExistError<T = unknown>(name: string): BaseImportError<T> {
  const option = {
    value: undefined,
    name: `${name} already exist`,
    reason: `We could not create a ${name} because it already exist on the app.`,
    message: `Please edit the corresponding sheet field with a different value.`,
  };
  return ImportError.newError(option);
}

export function getOptionalWarning(name: string) {
  return {
    field: '',
    value: undefined,
    name: `Missing ${name}`,
    reason: 'Optional field is missing.',
    message: 'Fill in the corresponding sheet field to add a value.',
    type: 'warning'
  } as const;
}

export function optionalWarning<T = unknown>(name: string, value?: T): BaseImportError<T> {
  const option: BaseImportError<T> = {
    // value is `undefined` by default because optional warning mean that the value is missing,
    // for other warning the value should passed as a parameter
    value,
    name: `Missing ${name}`,
    reason: 'Optional field is missing.',
    message: 'Fill in the corresponding sheet field to add a value.',
  };
  return ImportError.newWarning(option);
}

export function adminOnlyWarning<T = unknown>(value: T, name: string): BaseImportError<T> {
  const option: BaseImportError<T> = {
    value,
    reason: "This field is reserved for admins, it's value will be omitted.",
    message: 'Remove the corresponding sheet field to silence this warning.',
    name: 'Admin only warning'
  };
  return ImportError.newWarning(option);
}

export function wrongValueWarning<T = unknown>(value: T, name: string, wrongData: string[]): BaseImportError<T> {
  const option: BaseImportError<T> = {
    value,
    name: `Wrong ${name}`,
    reason: `Be careful, ${wrongData.length} values were wrong and will be omitted.`,
    message: `${wrongData.slice(0, 3).join(', ')}...`
  };
  return ImportError.newWarning(option);
}

//@todo: harmonize ExceptionError with BaseImportError
export interface ExceptionError<T> {
  name: string,
  message: any,
  reason?: string
  value?: T
  type?: 'error' | 'warning'
}

export function exceptionCaughtError<T = unknown>(options: ExceptionError<T>): ValueWithError<T> {
  const { name, message, value, type, reason } = options;
  return {
    value,
    error: {
      type,
      name,
      reason,
      message
    }
  };
}


export class BaseImportError<T> extends Error {
  value: T;
  reason: string;
  field?: string;
  message: string;

  constructor(options: ValueWithErrorSimple<T>) {
    super(options.message);
    const { value, message, name, reason, field = '' } = options;
    this.name = name;
    this.value = value;
    this.reason = reason;
    this.field = field;
    this.message = message;
  }
}

export class ImportError<T> extends BaseImportError<T> {
  public type: 'error' | 'warning';

  private constructor(options: ValueWithErrorSimple<T>) {
    super(options);
    this.type = options.type;
  }

  static newError<T>(options: BaseImportError<T>) {
    return new ImportError({ ...options, type: 'error' });
  }

  static newWarning<T>(options: BaseImportError<T>) {
    return new ImportError({ ...options, type: 'warning' });
  }

  getValue() {
    return {
      name: this.name,
      hint: this.message,
      field: this.field,
      reason: this.reason,
      type: this.type
    }
  }
}
