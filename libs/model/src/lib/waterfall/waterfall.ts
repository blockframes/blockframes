import { Mandate, Sale, createContract } from '../contract';
import { Income } from '../income';
import { StorageFile } from '../media';
import { DocumentMeta, createDocumentMeta } from '../meta';
import { Media, RightholderRole, Territory } from '../static';
import { allOf } from '../avail';

export interface WaterfallPermissions {
  _meta?: DocumentMeta;
  id: string; // orgId
  // #9254 If not movie owner, define the orgIds visible in the waterfall by the current org
  scope: string[];
  // Roles will define what can org do on waterfall/blocks/actions/...
  roles: RightholderRole[]
}

export function createWaterfallPermissions(params: Partial<WaterfallPermissions> = {}): WaterfallPermissions {
  return {
    id: '',
    scope: [],
    roles: [],
    ...params,
  }
}

export interface Version {
  id: string;
  name: string;
  description?: string;
  blockIds: string[]
}

export function createVersion(params: Partial<Version> = {}) {
  const version: Version = {
    id: '',
    name: '',
    blockIds: [],
    ...params
  }

  if (!version.name) version.name = version.id;
  return version;
}

interface WaterfallFile extends StorageFile {
  id: string; // TODO #9389 will be the id of the subCollection WaterfallDocument that stores data linked to this file
  privacy: 'protected';
  name?: string; // TODO #9389 file name
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

export function getAssociatedSource(income: Income, sources: WaterfallSource[] = []) {
  if (income.sourceId) return sources.find(s => s.id === income.sourceId);
  return sources.find(source => allOf(income.territories).in(source.territories) && allOf(income.medias).in(source.medias));
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
}

export interface WaterfallRightholder {
  id: string;
  name: string;
  roles: RightholderRole[];
};

export interface Waterfall {
  _meta?: DocumentMeta;
  id: string;
  versions: Version[]
  orgIds: string[]; // Orgs linked to waterfall, can read document if in it
  documents: WaterfallFile[];
  sources: WaterfallSource[];
  rightholders: WaterfallRightholder[];
}

export function createWaterfall(params: Partial<Waterfall> = {}): Waterfall {
  return {
    id: '',
    versions: [],
    orgIds: [],
    documents: [],
    sources: [],
    rightholders: [],
    ...params,
  }
}

export function createWaterfallDocument<Meta extends WaterfallDocumentMeta>(params: Partial<WaterfallDocument<Meta>> = {}): WaterfallDocument<Meta> {

  const toObject = () => {
    if (isContract(params)) return createContract({ ...params.meta, status: 'accepted' }) as Meta;
    if (isBudget(params)) return params.meta as Meta;
    if (isFinancingPlan(params)) return params.meta as Meta;
  };

  const meta = toObject();
  delete (meta as any).id;
  delete (meta as any)._meta;
  delete (meta as any).rootId;
  delete (meta as any).signatureDate;
  delete (meta as any).titleId;

  return {
    _meta: (params.meta as any)._meta || createDocumentMeta({ createdAt: new Date() }),
    id: (params.meta as any).id ?? '',
    type: 'contract',
    folder: '',
    waterfallId: '',
    ownerId: '',
    sharedWith: [],
    rootId: (params.meta as any).rootId ?? '',
    signatureDate: (params.meta as any).signatureDate ?? new Date(),
    ...params,
    meta,
  };
}

export const isContract = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallContract> => document?.type === 'contract';
const isBudget = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallBudget> => document?.type === 'budget';
const isFinancingPlan = (document: Partial<WaterfallDocument>): document is WaterfallDocument<WaterfallFinancingPlan> => document?.type === 'financingPlan';

export function convertDocumentTo<T>(document: WaterfallDocument): T {
  switch (document.type) {
    case 'contract':
      return {
        id: document.id,
        rootId: document.rootId,
        signatureDate: document.signatureDate,
        titleId: document.waterfallId,
        ...document.meta as T,
        _meta: document._meta
      };
    default:
      break;
  }
}

type WaterfallDocumentMeta = WaterfallBudget | WaterfallContract | WaterfallFinancingPlan;
export interface WaterfallDocument<Meta extends WaterfallDocumentMeta = unknown> {
  _meta?: DocumentMeta;
  id: string; // TODO #9389 same id as the actual PDF file stored in waterfall/{waterfallId}/documents
  /** If document is an amendment, provide root document Id */
  rootId: string;
  signatureDate?: Date;
  type: 'financingPlan' | 'budget' | 'contract';
  folder: string; // TODO #9389 to create the folder arborescence in UI
  waterfallId: string; // Parent document Id
  ownerId: string; // TODO #9389 uploader orgId
  sharedWith: string[]; // TODO #9389 orgIds allowed to see the document
  meta: Meta;
}

interface WaterfallBudget {
  // TODO #9389 add form data
  value?: string;
}

export type WaterfallContract = Mandate | Sale;

interface WaterfallFinancingPlan {
  // TODO #9389 add form data
  value?: string;
}
