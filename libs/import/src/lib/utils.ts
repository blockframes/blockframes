import { MovieService } from '@blockframes/movie/service';
import {
  Movie,
  Organization,
  User,
  Mandate,
  Sale,
  Term,
  Income,
  Expense,
  WaterfallDocument,
  WaterfallRightholder,
  WaterfallSource,
  Right,
  createWaterfallRightholder,
  Statement,
  ExpenseType,
  Amortization,
  createAmortization,
} from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { ContractService } from '@blockframes/contract/contract/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { UserService } from '@blockframes/user/service';
import { where } from 'firebase/firestore';
import { TermService } from '@blockframes/contract/term/service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { AmortizationService } from '@blockframes/waterfall/amortization.service';

export const spreadsheetImportTypes = ['titles', 'organizations', 'contracts', 'documents', 'sources', 'rights', 'statements'] as const;

export type SpreadsheetImportType = typeof spreadsheetImportTypes[number];

export interface SpreadsheetImportEvent {
  sheet: SheetTab;
  importType: SpreadsheetImportType;
}

export interface SpreadsheetImportError {
  name: string;
  reason: string;
  type?: 'error' | 'warning';
  field?: string;
  message?: string;
}

export interface ImportState {
  errors?: SpreadsheetImportError[];
  imported?: boolean;
  importing?: boolean;
}

export interface MovieImportState extends ImportState {
  movie: Movie;
}

export interface ContractsImportState extends ImportState {
  newContract: boolean;
  contract: Sale | Mandate;
  terms: Term[];
}

export interface DocumentsImportState extends ImportState {
  document: WaterfallDocument;
  terms: Term[];
  rightholders: Record<string, WaterfallRightholder[]>;
}

export interface OrganizationsImportState extends ImportState {
  org: Organization;
  superAdmin: User;
  newOrg: boolean;
}

export interface SourcesImportState extends ImportState {
  source: WaterfallSource;
  waterfallId: string;
}

export interface RightsImportState extends ImportState {
  waterfallId: string;
  right: Right;
  rightholders: Record<string, WaterfallRightholder[]>;
  amortizations: Record<string, Amortization[]>;
}

export interface StatementsImportState extends ImportState {
  statement: Statement;
  incomes: Income[];
  expenses: Expense[];
  expenseTypes: Record<string, ExpenseType[]>;
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
  documents: 10,
  sources: 10,
  rights: 2,
  statements: 10,
};

export const sheetRanges: Record<SpreadsheetImportType, string> = {
  titles: `A${sheetHeaderLine.titles}:BZ1000`,
  contracts: `A${sheetHeaderLine.contracts}:Q300`,
  documents: `A${sheetHeaderLine.documents}:U800`,
  organizations: `A${sheetHeaderLine.organizations}:Z100`,
  sources: `A${sheetHeaderLine.sources}:G100`,
  rights: `A${sheetHeaderLine.rights}:AZ100`,
  statements: `A${sheetHeaderLine.statements}:V400`,
};

export async function getOrgId(
  name: string,
  orgService: OrganizationService,
  cache: Record<string, string>,
  centralOrg?: Organization
) {
  if (!name) return '';
  if (centralOrg && (name === centralOrg.name || name === centralOrg.id)) return centralOrg.id;

  if (cache[name]) return cache[name];

  const orgs = await orgService.getValue([where('name', '==', name)]);
  const result = orgs.length === 1 ? orgs[0].id : '';
  cache[name] = result;
  return result;
}

export async function getRightholderId(
  valueOrId: string,
  waterfallId: string,
  waterfallService: WaterfallService,
  cache: Record<string, WaterfallRightholder[]>
) {

  const value = valueOrId.trim();
  if (!cache[waterfallId]) {
    const { rightholders } = await waterfallService.getValue(waterfallId);
    cache[waterfallId] = rightholders.map(r => ({ ...r, name: r.name.trim() }));
  }

  const rightholder = cache[waterfallId].find(r => r.name.toLowerCase() === value.toLowerCase() || r.id === valueOrId);
  if (rightholder) return rightholder.id;

  cache[waterfallId].push(createWaterfallRightholder({ id: waterfallService.createId(), name: value, roles: [] }));
  return cache[waterfallId].find(r => r.name === value || r.id === valueOrId).id;
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
  let title: Movie;
  try {
    title = await titleService.getValue(nameOrId);
  } catch (err) {/**do nothing, nameOrId isn't an id */ }

  // Try if nameOrId is an id
  if (title) {
    if (isBlockframesAdmin) return memo(nameOrId, title);
    if (title.orgIds.includes(userOrgId)) return memo(nameOrId, title);
    throw orgWithNoTitleError(nameOrId);
  }
  // nameOrId is the international title name
  const queryFn = isBlockframesAdmin
    ? [where('title.international', '==', nameOrId)]
    : [where('title.international', '==', nameOrId), where('orgIds', 'array-contains', userOrgId)];
  const titles = await titleService.getValue(queryFn);
  if (!titles.length) throw noTitleError(nameOrId);
  if (titles.length !== 1) throw sameTitleNameError(nameOrId);
  return memo(nameOrId, titles[0]);
}

export async function getAmortizationId(
  valueOrId: string,
  waterfallId: string,
  poolName: string,
  amortizationService: AmortizationService,
  cache: Record<string, Amortization[]>
) {

  const value = valueOrId.trim();
  if (!cache[waterfallId]) {
    cache[waterfallId] = await amortizationService.getValue({ waterfallId });
  }

  const amortization = cache[waterfallId].find(r => r.name.toLowerCase() === value.toLowerCase() || r.id === valueOrId);
  if (amortization) return amortization.id;

  cache[waterfallId].push(createAmortization({ id: amortizationService.createId(), name: value, waterfallId, poolName }));
  return cache[waterfallId].find(r => r.name === value || r.id === valueOrId).id;
}

export async function getContract(
  id: string,
  contractService: ContractService,
  cache: Record<string, Mandate | Sale>
) {
  if (!id) return;

  if (cache[id]) return cache[id];

  try {
    const contract = await contractService.getValue(id);
    cache[id] = contract;
    return contract;
  } catch (err) {/**do nothing*/ }

  return;
}

export async function getWaterfallDocument(
  id: string,
  waterfallDocumentsService: WaterfallDocumentsService,
  cache: Record<string, WaterfallDocument>,
  waterfallId: string
) {
  if (!id) return;

  if (cache[id]) return cache[id];

  try {
    const contract = await waterfallDocumentsService.getValue(id, { waterfallId });
    cache[id] = contract;
    return contract;
  } catch (err) {/**do nothing*/ }

  return;
}

export async function getTerm(
  id: string,
  termService: TermService,
  cache: Record<string, Term>
) {
  if (!id) return;

  if (cache[id]) return cache[id];

  try {
    const term = await termService.getValue(id);
    cache[id] = term;
    return term;
  } catch (err) {/**do nothing*/ }

  return;
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

export function getDate(value: string, name = 'Date') {
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

  if (isNaN(date.getTime())) throw wrongValueError(value, name);

  // if date seems strange we throw an Error
  const year = date.getFullYear();
  if (year < 1895 || year > 2200) throw outOfRangeDate(value);
  // important dates be set to midnight for avails research
  date.setHours(0, 0, 0, 0);
  return date;
}

function outOfRangeDate(name: string): ImportLog<string> {
  const option: SpreadsheetImportError = {
    name: `Invalid ${name}`,
    reason: 'The date seems too far away in the past or in the future.',
    message: 'Date must be between 1895 and 2200, if the date seems to be correct please check that Excel format the cell as a Date.',
  };
  return new ImportError(name, option);
}

export function mandatoryError<T = unknown>(value: T, name: string, reason?: string): ImportLog<T> {
  const option: SpreadsheetImportError = {
    name: `Missing ${name}`,
    reason: reason || 'Mandatory field is missing.',
    message: 'Please fill in the corresponding sheet field.',
  };
  return new ImportError(value, option);
}

export function wrongTemplateError(templateImported: 'seller' | 'admin'): ImportLog<string> {
  const messages = {
    admin: 'Please contact team@archipelcontent.com or use a template that\'s appropriate to sellers',
    seller: 'Please contact team@archipelcontent.com or use a template that\'s appropriate to admins',
  }

  const option: SpreadsheetImportError = {
    name: 'Wrong Template',
    reason: `You are not permitted to import ${templateImported === 'admin' ? 'an' : 'a'} ${templateImported} template.`,
    message: messages[templateImported],
  };
  return new WrongTemplateError(templateImported, option);
}

export function unknownEntityError<T = unknown>(value: T, name: string): ImportLog<T> {
  const option: SpreadsheetImportError = {
    name: `Unknown ${name}`,
    reason: `${name} should exist in the app but we couldn't find it.`,
    message: `Please check the corresponding sheet field for mistake, create the corresponding ${name} if you can, or contact us.`,
  };
  return new ImportError(value, option);
}

function noTitleError(name: string): ImportLog<string> {
  const option: SpreadsheetImportError = {
    name: 'Error on title name or ID',
    reason: `No title found with name/id "${name}".`,
    message: `Please check the corresponding sheet field for mistake, create the corresponding ${name} if you can, or contact us.`,
  };
  return new ImportError(name, option);
}

function sameTitleNameError(name: string): ImportLog<string> {
  const option: SpreadsheetImportError = {
    name: 'Error on title name or ID',
    reason: `Multiple titles with name "${name}" found.`,
    message: `Please check the corresponding sheet field for mistake, create the corresponding ${name} if you can, or contact us.`,
  };
  return new ImportError(name, option);
}

function orgWithNoTitleError(name: string): ImportLog<string> {
  const option: SpreadsheetImportError = {
    name: 'Error on title name or ID',
    reason: `${name} does not belong to your org`,
    message: `You don't have access to title with id: ${name}`,
  };
  return new ImportError(name, option);
}

export function wrongValueError<T = unknown>(value: T, name: string): ImportLog<T> {
  const option: SpreadsheetImportError = {
    name: `Wrong ${name}`,
    reason: `${name} should be a value of the given list.`,
    message: 'Please check the corresponding sheet field for mistakes, be sure to select a value form the list.',
  };
  return new ImportError(value, option);
}

export function unusedMandateIdWarning<T extends string>(value: T): ImportLog<T> {
  const option: SpreadsheetImportError = {
    field: 'parentTerm',
    name: 'Unused Mandate ID/Row',
    reason:
      'Mandate ID is used only for sales contracts, here the value will be omitted because the contract is a mandate.',
    message: 'Remove the corresponding sheet field to silence this warning.',
  };
  return new ImportWarning(value, option);
}

export function alreadyExistError<T = unknown>(value: T, name: string): ImportLog<T> {
  const option = {
    name: `${name} already exist`,
    reason: `We could not create a ${name} because it already exist on the app.`,
    message: `Please edit the corresponding sheet field with a different value.`,
  };
  return new ImportError(value, option);
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

export function optionalWarning<T = unknown>(name: string, value?: T): ImportLog<T> {
  const option: SpreadsheetImportError = {
    // value is `undefined` by default because optional warning mean that the value is missing,
    // for other warning the value should passed as a parameter
    name: `Missing ${name}`,
    reason: 'Optional field is missing.',
    message: 'Fill in the corresponding sheet field to add a value.',
  };
  return new ImportWarning(value, option);
}

export function adminOnlyWarning<T = unknown>(value: T): ImportLog<T> {
  const option: SpreadsheetImportError = {
    reason: "This field is reserved for admins, it's value will be omitted.",
    message: 'Remove the corresponding sheet field to silence this warning.',
    name: 'Admin only warning'
  };
  return new ImportWarning(value, option);
}

export function wrongValueWarning<T = unknown>(value: T, name: string, wrongData: string[]): ImportLog<T> {
  const option: SpreadsheetImportError = {
    name: `Wrong ${name}`,
    reason: `Be careful, ${wrongData.length} values were wrong and will be omitted.`,
    message: `${wrongData.slice(0, 3).join(', ')}...`
  };
  return new ImportWarning(value, option);
}

export function valueToId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[\])}[{(]/g, '') // remove brackets
    .replace(/['`"+-.,/\\()]/g, ' ') // replace special characters by space
    .replace(/&/g, 'AND')
    .replace(/<=/g, 'lte')
    .replace(/>=/g, 'gte')
    .replace(/!=/g, 'neq')
    .replace(/</g, 'lt')
    .replace(/>/g, 'gt')
    .replace(/=/g, 'eq')
    .split(' ')
    .filter(v => !!v)
    .join('_');
}

export abstract class ImportLog<T> extends Error {
  reason: string;
  field?: string;
  message: string;
  abstract type: 'warning' | 'error';

  constructor(private value: T, options: SpreadsheetImportError) {
    super(options.message);
    const { message = '', name, reason, field = '' } = options;
    this.name = name;
    this.reason = reason;
    this.field = field;
    this.message = message;
  }

  toJson() {
    return {
      type: this.type,
      name: this.name,
      reason: this.reason,
      field: this.field,
      message: this.message,
    }
  }
}

export class ImportError<T> extends ImportLog<T> {
  public readonly type = 'error';
}

export class ImportWarning<T> extends ImportLog<T> {
  public readonly type = 'warning';
}

export class WrongTemplateError<T> extends ImportLog<T> {
  public readonly type = 'error';
}
