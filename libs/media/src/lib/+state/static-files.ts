
import { FileMetaData } from "./media.model";


export const collectionHoldingFiles = [
  'orgs',
  'users',
  'movies',
  'campaigns'
] as const;
export type CollectionHoldingFile = typeof collectionHoldingFiles[number];

export const fileLabels = [
  // orgs
  'logo',
  'notes',

  // users
  'avatar',
  'watermark',

  // movies
  'poster',
  'banner',
  'scenario',
  'moodboard',
  'presentation_deck',
  'still_photo',
  'screener',
  'otherVideo',
  'salesPitch',

  // orgs & movies
  'notes',

  // campaigns
  'budget',
  'financingPlan',
  'waterfall',
] as const;
export type FileLabel = typeof fileLabels[number];

export const storagePaths: Record<CollectionHoldingFile, Partial<Record<FileLabel, string>>> = {
  orgs: {
    logo: 'logo',
    notes: 'documents.notes'
  },
  users: {
    avatar: 'avatar',
    watermark: 'watermark',
  },
  movies: {
    poster: 'poster',
    banner: 'banner',
    scenario: 'promotional.scenario',
    moodboard: 'promotional.moodboard',
    'presentation_deck': 'promotional.',
    'still_photo': 'promotional.still_photo',
    screener: 'promotional.videos.screener',
    otherVideo: 'promotional.videos.otherVideos',
    salesPitch: 'promotional.salesPitch',
    notes: 'promotional.notes'
  },
  campaigns: {
    budget: 'files.budget',
    financingPlan: 'files.financingPlan',
    waterfall: 'files.waterfall',
  },
};

export function getFileStoragePath(collection: CollectionHoldingFile, label: FileLabel, docId: string) {
  const pathPart = storagePaths[collection][label];
  if (!pathPart) return '';

  return `${collection}/${docId}/${pathPart}`;
}

export function getFileMetadata(collection: CollectionHoldingFile, label: FileLabel, docId: string) {
  const metadatas: Record<CollectionHoldingFile, Partial<Record<FileLabel, FileMetaData>>> = {
    orgs: {
      logo: { uid: '', privacy: 'public', collection, docId, field: 'logo' },
      notes: { uid: '', privacy: 'protected', collection, docId, field: 'documents.notes' },
    },
    users: {
      avatar: { uid: '', privacy: 'public', collection, docId, field: 'avatar' },
      watermark: { uid: '', privacy: 'public', collection, docId, field: 'watermark' },
    },
    movies: {
      poster: { uid: '', privacy: 'public', collection, docId, field: 'poster' },
      banner: { uid: '', privacy: 'public', collection, docId, field: 'poster' },
      scenario: { uid: '', privacy: 'public', collection, docId, field: 'promotional.scenario' },
      moodboard: { uid: '', privacy: 'public', collection, docId, field: 'promotional.moodboard' },
      'presentation_deck': { uid: '', privacy: 'public', collection, docId, field: 'promotional.presentation_deck' },
      'still_photo': { uid: '', privacy: 'public', collection, docId, field: 'promotional.still_photo' },
      notes: { uid: '', privacy: 'public', collection, docId, field: 'promotional.notes' },
      screener: { uid: '', privacy: 'protected', collection, docId, field: 'promotional.videos.screener' },
      otherVideo: { uid: '', privacy: 'public', collection, docId, field: 'promotional.videos.otherVideos' },
      salesPitch: { uid: '', privacy: 'public', collection, docId, field: 'promotional.salesPitch' },
    },
    campaigns: {
      budget: { uid: '', privacy: 'public', collection, docId, field: 'files.budget' },
      financingPlan: { uid: '', privacy: 'public', collection, docId, field: 'files.financingPlan' },
      waterfall: { uid: '', privacy: 'public', collection, docId, field: 'files.waterfall' },
    },
  };
  return metadatas[collection][label];
}
