
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
  'videos',

  // users
  'avatar',

  // movies
  'poster',
  'banner',
  'scenario',
  'moodboard',
  'presentation_deck',
  'still_photo',
  'screener',
  'otherVideos',
  'salesPitch',

  //catalog & movies
  'delivery',

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
    notes: 'documents.notes',
    videos: 'documents.videos',
  },
  users: {
    avatar: 'avatar'
  },
  movies: {
    poster: 'poster',
    banner: 'banner',
    scenario: 'promotional.scenario',
    moodboard: 'promotional.moodboard',
    'presentation_deck': 'promotional.presentation_deck',
    'still_photo': 'promotional.still_photo',
    screener: 'promotional.videos.screener',
    otherVideos: 'promotional.videos.otherVideos',
    salesPitch: 'promotional.videos.salesPitch',
    notes: 'promotional.notes',
    delivery: 'delivery.file',
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
  const fileId = Math.random().toString(36).substr(2);
  const metadatas: Record<CollectionHoldingFile, Partial<Record<FileLabel, FileMetaData>>> = {
    orgs: {
      logo: { uid: '', privacy: 'public', collection, docId, field: 'logo' },
      notes: { uid: '', privacy: 'protected', collection, docId, field: 'documents.notes' },
      videos: { uid: '', privacy: 'protected', collection, docId, field: 'documents.videos', fileId },
    },
    users: {
      avatar: { uid: '', privacy: 'public', collection, docId, field: 'avatar' }
    },
    movies: {
      poster: { uid: '', privacy: 'public', collection, docId, field: 'poster' },
      banner: { uid: '', privacy: 'public', collection, docId, field: 'banner' },
      scenario: { uid: '', privacy: 'public', collection, docId, field: 'promotional.scenario' },
      moodboard: { uid: '', privacy: 'public', collection, docId, field: 'promotional.moodboard' },
      'presentation_deck': { uid: '', privacy: 'public', collection, docId, field: 'promotional.presentation_deck' },
      'still_photo': { uid: '', privacy: 'public', collection, docId, field: 'promotional.still_photo' },
      notes: { uid: '', privacy: 'public', collection, docId, field: 'promotional.notes' },
      screener: { uid: '', privacy: 'protected', collection, docId, field: 'promotional.videos.screener' },
      otherVideos: { uid: '', privacy: 'protected', collection, docId, field: 'promotional.videos.otherVideos', fileId },
      salesPitch: { uid: '', privacy: 'protected', collection, docId, field: 'promotional.videos.salesPitch' },
      delivery: { uid: '', privacy: 'public', collection, docId, field: 'delivery.file' },
    },
    campaigns: {
      budget: { uid: '', privacy: 'public', collection, docId, field: 'files.budget' },
      financingPlan: { uid: '', privacy: 'public', collection, docId, field: 'files.financingPlan' },
      waterfall: { uid: '', privacy: 'public', collection, docId, field: 'files.waterfall' },
    },
  };
  return metadatas[collection][label];
}
