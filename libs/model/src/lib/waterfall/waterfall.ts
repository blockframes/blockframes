import { BaseContract } from '../contract';
import { Income } from '../income';
import { StorageFile } from '../media';
import { DocumentMeta, createDocumentMeta } from '../meta';
import { Media, RightholderRole, Territory, rightholderGroups } from '../static';
import { allOf } from '../avail';
import { ExpenseType } from '../expense';

export interface WaterfallPermissions {
  _meta?: DocumentMeta;
  id: string; // orgId
  // Define the rightholderIds (fake orgs) that this current org can impersonate
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
  name: string;
  description?: string;
  blockIds: string[]
}

export function createVersion(params: Partial<Version> = {}) {
  const version: Version = {
    id: '',
    default: true,
    name: '',
    blockIds: [],
    ...params
  }

  if (!version.name) version.name = version.id;
  return version;
}

function getDefaultVersion(waterfall: Waterfall) {
  return waterfall.versions.find(v => v.default);
}

export function getDefaultVersionId(waterfall: Waterfall) {
  return getDefaultVersion(waterfall)?.id;
}

export function isDefaultVersion(waterfall: Waterfall, versionId: string) {
  if (!versionId) return false;
  return getDefaultVersionId(waterfall) === versionId;
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
    ...params
  }
}

export function getAssociatedSource(income: Income, sources: WaterfallSource[]) {
  if (income.sourceId) return sources.find(s => s.id === income.sourceId);
  const candidates = sources.filter(source => allOf(income.territories).in(source.territories) && allOf(income.medias).in(source.medias));
  if (candidates.length === 0) throw new Error(`Could not find source for income "${income.id}"`);
  if (candidates.length > 1) throw new Error(`Too many sources matching income "${income.id}" : ${candidates.map(c => c.id).join(',')}`);
  return candidates[0];
}

export function getIncomesSources(incomes: Income[], sources: WaterfallSource[]) {
  return Array.from(new Set(incomes.map(i => getAssociatedSource(i, sources))));
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
  // TODO #9520 sources whould be versionned as right, expenses etc..
}

export interface WaterfallRightholder {
  id: string;
  name: string;
  roles: RightholderRole[];
  // TODO #9520 versionId to lockVersion for this rightholder ?
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
    sources: [],
    expenseTypes: {},
    ...params,
    rightholders: params.rightholders?.map(r => createWaterfallRightholder(r)) ?? [],
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
    if (isBudget(params)) return params.meta as Meta;
    if (isFinancingPlan(params)) return params.meta as Meta;
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
    ...params
  }
}

export const isContract = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallContract> => document?.type === 'contract';
const isBudget = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallBudget> => document?.type === 'budget';
const isFinancingPlan = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallFinancingPlan> => document?.type === 'financingPlan';

export function isWaterfallMandate(contract: Partial<WaterfallContract>): contract is WaterfallMandate {
  return Object.keys(rightholderGroups.distributors).includes(contract.type);
}

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
    default:
      break;
  }
}

export type WaterfallDocumentMeta = WaterfallBudget | WaterfallContract | WaterfallFinancingPlan;

export interface WaterfallDocument<Meta extends WaterfallDocumentMeta = unknown> {
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

interface WaterfallBudget {
  // Not implemented yet
  value?: string;
}

export interface WaterfallContract extends BaseContract {
  type: RightholderRole;
  name: string;
};

export interface WaterfallSale extends WaterfallContract {
  type: keyof typeof rightholderGroups.sales;
}

export interface WaterfallMandate extends WaterfallContract {
  type: keyof typeof rightholderGroups.distributors;
}

interface WaterfallFinancingPlan {
  // Not implemented yet
  value?: string;
}
