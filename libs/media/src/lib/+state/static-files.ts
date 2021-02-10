
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

  // campaigns
  'budget',
  'financingPlan',
  'waterfall',
] as const;
export type FileLabel = typeof fileLabels[number];

export const storagePaths: Record<CollectionHoldingFile, Partial<Record<FileLabel, string>>> = {
  orgs: {
    logo: 'logo',
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
  },
  campaigns: {
    // TODO issue#4002
  },
};

export function getFileStoragePath(collection: CollectionHoldingFile, label: FileLabel) {
  const pathPart = storagePaths[collection][label];
  if (!pathPart) return '';

  return `${collection}/${pathPart}`;
}

export function getFileMetadata(collection: CollectionHoldingFile, label: FileLabel, docId: string, index?: number) {
  const metadatas: Record<CollectionHoldingFile, Partial<Record<FileLabel, FileMetaData>>> = {
    orgs: {
      logo: { uid: '', privacy: 'public', collection, docId, field: 'logo' },
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
      'still_photo': { uid: '', privacy: 'public', collection, docId, field: `promotional.still_photo[${index}]` },
      screener: { uid: '', privacy: 'protected', collection, docId, field: 'promotional.videos.screener' },
      otherVideo: { uid: '', privacy: 'public', collection, docId, field: `promotional.videos.otherVideos[${index}]` },
      salesPitch: { uid: '', privacy: 'public', collection, docId, field: 'promotional.salesPitch' },
    },
    campaigns: {
      // TODO issue#4002
    },
  };
  return metadatas[collection][label];
}
