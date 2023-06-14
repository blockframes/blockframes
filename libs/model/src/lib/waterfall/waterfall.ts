import { StorageFile } from '../media';
import { DocumentMeta } from '../meta';
import { RightholderRole } from '../static';

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

export interface Waterfall {
  _meta?: DocumentMeta;
  id: string;
  versions: Version[]
  orgIds: string[]; // Orgs linked to waterfall, can read document if in it
  documents: WaterfallFile[];
}

export function createWaterfall(params: Partial<Waterfall> = {}): Waterfall {
  return {
    id: '',
    versions: [],
    orgIds: [],
    documents: [],
    ...params,
  }
}

type WaterfallDocumentMeta = WaterfallBudget | WaterfallContract | WaterfallFinancingPlan;
export interface WaterfallDocument<Meta extends WaterfallDocumentMeta = unknown> {
  _meta?: DocumentMeta;
  id: string; // TODO #9389 same id as the actual PDF file stored in waterfall/{waterfallId}/documents
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

interface WaterfallContract {
  contractId: string // id of the contract document
}

interface WaterfallFinancingPlan {
  // TODO #9389 add form data
  value?: string;
}
