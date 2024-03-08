import { BaseContract, getContractsWith } from '../contract';
import { Income } from '../income';
import { StorageFile } from '../media';
import { DocumentMeta, createDocumentMeta } from '../meta';
import { Media, RightholderRole, StatementType, Territory, rightholderGroups, statementsRolesMapping } from '../static';
import { ExpenseType } from '../expense';

export interface WaterfallPermissions {
  _meta?: DocumentMeta;
  id: string; // orgId
  // Define the rightholderIds (fake orgs) that this current org can impersonate. Only one rightholderId per org for now
  rightholderIds: string[];
  // Is the current org admin of the waterfall
  isAdmin: boolean;
}

export function createWaterfallPermissions(params: Partial<WaterfallPermissions> = {}): WaterfallPermissions {
  return {
    id: '',
    rightholderIds: [],
    isAdmin: false,
    ...params,
  }
}

export interface Version {
  id: string;
  default: boolean;
  standalone: boolean;
  name: string;
  description?: string;
  blockIds: string[]
}

export function createVersion(params: Partial<Version> = {}) {
  const version: Version = {
    id: '',
    default: true,
    standalone: false, // If true, indicates that this version does not share any rights or sources with other versions
    name: '',
    blockIds: [],
    ...params
  }

  if (!version.name) version.name = version.id;
  return version;
}

export function getDefaultVersion(waterfall: Waterfall) {
  return waterfall.versions.find(v => v.default);
}

export function hasDefaultVersion(waterfall: Waterfall) {
  return !!getDefaultVersion(waterfall);
}

export function getDefaultVersionId(waterfall: Waterfall) {
  return getDefaultVersion(waterfall)?.id;
}

export function isDefaultVersion(waterfall: Waterfall, versionId: string) {
  if (!versionId) return false;
  return getDefaultVersionId(waterfall) === versionId;
}

export function isStandaloneVersion(waterfall: Waterfall, versionId: string) {
  if (!versionId) return false;
  return waterfall.versions.find(v => v.id === versionId)?.standalone;
}

export interface WaterfallFile extends StorageFile {
  id: string; // Same as the WaterfallDocument id
  privacy: 'protected';
}

export function createWaterfallSource(params: Partial<WaterfallSource>): WaterfallSource {
  return {
    id: '',
    name: '',
    territories: [],
    medias: [],
    destinationId: '',
    version: {},
    ...params
  }
}

/**
 * Fetch versionned sources if versionId is provided, else return all sources
 * @param waterfall 
 * @param versionId 
 * @returns 
 */
export function waterfallSources(waterfall: Waterfall, versionId?: string): WaterfallSource[] {
  if (!versionId) return waterfall.sources;
  const version = waterfall.versions.find(v => v.id === versionId);
  if (!version) return waterfall.sources;
  const sources = waterfall.sources;

  if (version.standalone) return sources.filter(s => s.version && s.version[version.id]);

  return sources.filter(r => !Object.values(r.version).some(v => v.standalone)).map(s => {
    if (!s.version) s.version = {};
    const destinationId = s.version[versionId] !== undefined ? s.version[versionId].destinationId : s.destinationId;
    return { ...s, destinationId };
  });
}

export function getIncomesSources(incomes: Income[], sources: WaterfallSource[]) {
  return Array.from(new Set(incomes.map(i => sources.find(s => s.id === i.sourceId))));
}

/**
 * Defines sources that an income will be associated to.
 * row_all, us_svod etc ..
 */
export interface WaterfallSource {
  id: string;
  name: string;
  territories: Territory[];
  medias: Media[];
  destinationId: string; // The rightId this income will go to
  version: Record<string, { standalone?: true, destinationId?: string }>;
}

export interface WaterfallRightholder {
  id: string;
  name: string;
  roles: RightholderRole[];
  lockedVersionId?: string;
};

export interface Waterfall {
  _meta?: DocumentMeta;
  id: string;
  versions: Version[]
  orgIds: string[]; // Orgs linked to waterfall, can read documents if in it
  documents: WaterfallFile[];
  sources: WaterfallSource[];
  rightholders: WaterfallRightholder[];
  expenseTypes: Record<string, ExpenseType[]>; // key is contractId or 'directSales'
}

export function createWaterfall(params: Partial<Waterfall> = {}): Waterfall {
  return {
    id: '',
    versions: [],
    orgIds: [],
    documents: [],
    expenseTypes: {},
    ...params,
    rightholders: params.rightholders?.map(r => createWaterfallRightholder(r)) ?? [],
    sources: params.sources?.map(s => createWaterfallSource(s)) ?? [],
  }
}

export function createWaterfallRightholder(params: Partial<WaterfallRightholder> = {}): WaterfallRightholder {
  return {
    id: '',
    name: '',
    roles: [],
    ...params,
  }
}

export function createWaterfallDocument<Meta extends WaterfallDocumentMeta>(params: Partial<WaterfallDocument<Meta>> = {}): WaterfallDocument<Meta> {

  const toObject = () => {
    if (isContract(params)) return createWaterfallContract({ ...params.meta, status: 'accepted' }) as Meta;
    if (isBudget(params)) return createWaterfallBudget(params.meta) as Meta;
    if (isFinancingPlan(params)) return createWaterfallFinancingPlan(params.meta) as Meta;
  };

  const meta = toObject();
  delete (meta as any).id;
  delete (meta as any)._meta;
  delete (meta as any).rootId;
  delete (meta as any).signatureDate;
  delete (meta as any).titleId;
  delete (meta as any).name;


  return {
    _meta: (params.meta as any)._meta || createDocumentMeta({ createdAt: new Date() }),
    id: (params.meta as any).id ?? '',
    type: 'contract',
    name: (params.meta as any).name ?? '',
    folder: '',
    waterfallId: '',
    ownerId: '',
    rootId: (params.meta as any).rootId ?? '',
    signatureDate: (params.meta as any).signatureDate ?? new Date(),
    ...params,
    meta,
  };
}

export function createWaterfallContract(params: Partial<WaterfallContract>): WaterfallContract {
  return {
    _meta: createDocumentMeta({}),
    id: '',
    name: '',
    titleId: '',
    termIds: [],
    buyerId: '',
    sellerId: '',
    type: 'mainDistributor',
    status: 'pending',
    stakeholders: [],
    rootId: '',
    price: [],
    ...params
  }
}

export function createWaterfallBudget(params: Partial<WaterfallBudget>): WaterfallBudget {
  return {
    _meta: createDocumentMeta({}),
    id: '',
    ...params
  }
}

export function createWaterfallFinancingPlan(params: Partial<WaterfallFinancingPlan>): WaterfallFinancingPlan {
  return {
    _meta: createDocumentMeta({}),
    id: '',
    ...params
  }
}

export const isContract = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallContract> => document?.type === 'contract';
export const isBudget = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallBudget> => document?.type === 'budget';
export const isFinancingPlan = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallFinancingPlan> => document?.type === 'financingPlan';

export function isWaterfallSale(contract: Partial<WaterfallContract>): contract is WaterfallSale {
  return Object.keys(rightholderGroups.sales).includes(contract.type);
}

export function convertDocumentTo<T>(document: WaterfallDocument): T {
  switch (document.type) {
    case 'contract':
      return {
        id: document.id,
        rootId: document.rootId,
        signatureDate: document.signatureDate,
        titleId: document.waterfallId,
        name: document.name,
        ...document.meta as T,
        _meta: document._meta
      };
    case 'budget':
      return {
        id: document.id,
        ...document.meta as T,
        _meta: document._meta
      };
    case 'financingPlan':
      return {
        id: document.id,
        ...document.meta as T,
        _meta: document._meta
      };
    default:
      break;
  }
}

export type WaterfallDocumentMeta = WaterfallBudget | WaterfallContract | WaterfallFinancingPlan;

export interface WaterfallDocument<Meta extends (WaterfallDocumentMeta | unknown) = unknown> {
  _meta?: DocumentMeta;
  id: string; // Same as the WaterfallFile id
  /** If document is an amendment, provide root document Id */
  rootId: string;
  name: string;
  signatureDate?: Date;
  type: 'financingPlan' | 'budget' | 'contract';
  folder: string; // TODO #9389 we might want to drop that for a sub-type, TO BE CONFIRMED WITH THE TEAM
  waterfallId: string; // Parent document Id
  ownerId: string; // Uploader orgId
  meta: Meta;
}

export interface WaterfallBudget {
  _meta?: DocumentMeta;
  id: string; // Same as the WaterfallFile id
}

export interface WaterfallInvestment {
  value: number;
  date: Date;
};

export interface WaterfallContract extends BaseContract {
  type: RightholderRole;
  name: string;
  price: WaterfallInvestment[];
};

export interface WaterfallSale extends WaterfallContract {
  type: keyof typeof rightholderGroups.sales;
}

export interface WaterfallFinancingPlan {
  _meta?: DocumentMeta;
  id: string; // Same as the WaterfallFile id
}

export function canCreateStatement(type: StatementType, rightholder: WaterfallRightholder, producer: WaterfallRightholder, contracts: WaterfallContract[], canBypassRules = false): boolean {
  if (!type) return false;
  if (canBypassRules) return true;
  // Only the producer can create direct sales and producer statements, and producer is always an admin
  if (['directSales', 'producer'].includes(type)) return false;
  if (!rightholder.roles.some(role => statementsRolesMapping[type].includes(role))) return false;
  return getContractsWith([producer.id, rightholder.id], contracts).filter(c => statementsRolesMapping[type].includes(c.type)).length !== 0;
}

export function canOnlyReadStatements(rightholder: WaterfallRightholder, canBypassRules = false) {
  return !canBypassRules && !rightholder?.roles.some(r => rightholderGroups.withStatements.includes(r));
}