import { Privacy } from "@blockframes/utils/file-sanitizer";
import { MediaRatioType } from '../../image/uploader/uploader.component';
import { MovieForm } from "@blockframes/movie/form/movie.form";
import { OrganizationForm } from "@blockframes/organization/forms/organization.form";
import { AllowedFileType } from "@blockframes/utils/utils";
import { Movie } from "@blockframes/movie/+state";
import { Organization } from "@blockframes/organization/+state/organization.model";
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';

import { CollectionHoldingFile, FileLabel, getFileMetadata } from '../../+state/static-files';
import { StorageFileForm } from "@blockframes/media/form/media.form";
import { FormList } from "@blockframes/utils/form";
import { StorageFile } from "@blockframes/media/+state/media.firestore";


interface DirectoryBase {
  type: 'directory' | 'file' | 'image' | 'list';
  /** Display Name use in the UI */
  name: string;
}

export interface Directory extends DirectoryBase {
  type: 'directory';
  icon?: string;
  /** Array of sub-folders */
  children: Record<string, (Directory | FileDirectory | ImgDirectory)>;
}

interface FileDirectoryBase extends DirectoryBase {
  meta: [CollectionHoldingFile, FileLabel, string];
  /** Wether or not this directory can contain several files *(like stills photo)* or only one *(like movie poster)* */
  // multiple: boolean;
  // docNameField: string;
  // fileRefField: string;
  /**
   * Corresponding path to the firebase storage
   * @note it **SHOULD NOT** start with a `/`
   * @note it **SHOULD NOT** end with a `/`
   * @note it **SHOULD NOT** contain the privacy (`public`/`protected`)
   * @note it **SHOULD NOT** contain the file name at the end
   */
  // storagePath: string;
  // privacy: Privacy;
  // hasFile: boolean | number;
}

export interface ImgDirectory extends FileDirectoryBase {
  type: 'image';
  ratio: MediaRatioType;
  form: StorageFileForm | FormList<StorageFile>;
}

export interface FileDirectory extends FileDirectoryBase {
  type: 'file';
  accept: AllowedFileType;
  form: StorageFileForm | FormList<StorageFile>;
}

export function getFormList(form: OrganizationForm | MovieForm, field: string) {
  return field.split('.').reduce((res, key) => res?.controls?.[key], form);
}

function titlesDirectory(titles: Movie[]) {
  const documents = {};
  for (const title of titles) {
    document[title.id] = titleDirectory(title);
  }
  return documents;
}

function getFormStorage(object: { id: string }, collection: CollectionHoldingFile, label: FileLabel) {
  const value = getDeepValue(object, getFileMetadata(collection, label, object.id).field);
  return new StorageFileForm(value);
}

function getFormListStorage(object: { id: string }, collection: CollectionHoldingFile, label: FileLabel) {
  const value = getDeepValue(object, getFileMetadata(collection, label, object.id).field);
  return FormList.factory<StorageFile>(value, file => new StorageFileForm(file));
}

function titleDirectory(title: Movie): Directory {
  return {
    name: title.title.international,
    type: 'directory',
    children: {
      poster: {
        name: 'Poster',
        type: 'image',
        ratio: 'poster',
        meta: ['movies', 'poster', title.id],
        form: getFormStorage(title, 'movies', 'poster'),
        // multiple: false,
        // docNameField: 'poster',
        // fileRefField: 'poster',
        // storagePath: `movies/${title.id}/poster`,
        // privacy: 'public',
        // hasFile: !!title.poster
      },
      banner: {
        name: 'Banner',
        type: 'image',
        ratio: 'banner',
        meta: ['movies', 'banner', title.id],
        form: getFormStorage(title, 'movies', 'banner'),
        // multiple: false,
        // docNameField: 'banner',
        // fileRefField: 'banner',
        // storagePath: `movies/${title.id}/banner`,
        // privacy: 'public',
        // hasFile: !!title.banner
      },
      scenario: {
        name: 'Scenario',
        type: 'file',
        accept: 'pdf',
        meta: ['movies', 'scenario', title.id],
        form: getFormStorage(title, 'movies', 'scenario'),
        // multiple: false,
        // docNameField: 'scenario',
        // fileRefField: 'scenario',
        // storagePath: `movies/${title.id}/promotional.scenario`,
        // privacy: 'public',
        // hasFile: !!title.promotional.scenario
      },
      moodboard: {
        name: 'Moodboard / Artistic Deck',
        type: 'file',
        accept: 'pdf',
        meta: ['movies', 'moodboard', title.id],
        form: getFormStorage(title, 'movies', 'moodboard'),
        // multiple: false,
        // docNameField: 'file',
        // fileRefField: 'file',
        // storagePath: `movies/${title.id}/promotional.moodboard`,
        // privacy: 'public',
        // hasFile: !!title.promotional.moodboard
      },
      'presentation_deck': {
        name: 'Presentation Deck',
        type: 'file',
        accept: 'pdf',
        meta: ['movies', 'presentation_deck', title.id],
        form: getFormStorage(title, 'movies', 'presentation_deck'),
        // multiple: false,
        // docNameField: 'presentation_deck',
        // fileRefField: 'presentation_deck',
        // storagePath: `movies/${title.id}/promotional.presentation_deck`,
        // privacy: 'public',
        // hasFile: !!title.promotional.presentation_deck
      },
      'still_photo': {
        name: 'Images',
        type: 'image',
        ratio: 'still',
        meta: ['movies', 'still_photo', title.id],
        form: getFormListStorage(title, 'movies', 'still_photo'),
        // multiple: true,
        // docNameField: '',
        // fileRefField: '',
        // ratio: 'still',
        // storagePath: `movies/${title.id}/promotional.still_photo`,
        // privacy: 'public',
        // hasFile: title.promotional.still_photo.length
      },
      screener: {
        name: 'Screener',
        type: 'file',
        accept: 'video',
        meta: ['movies', 'screener', title.id],
        form: getFormStorage(title, 'movies', 'screener'),
        // multiple: false,
        // docNameField: 'ref',
        // fileRefField: 'ref',
        // storagePath: `movies/${title.id}/promotional.videos.screener`,
        // privacy: 'protected',
        // hasFile: !!title.promotional.videos?.screener?.ref
      },
      otherVideo: {
        name: 'Other Videos',
        type: 'file',
        accept: 'video',
        meta: ['movies', 'otherVideo', title.id],
        form: getFormListStorage(title, 'movies', 'otherVideo'),
        // multiple: true,
        // docNameField: 'ref',
        // fileRefField: 'ref',
        // storagePath: `movies/${title.id}/promotional.videos.otherVideos`,
        // privacy: 'public',
        // hasFile: title.promotional.videos?.otherVideos?.length
      },
      salesPitch: {
        name: 'Sales Pitch',
        type: 'file',
        accept: 'video',
        meta: ['movies', 'salesPitch', title.id],
        form: getFormStorage(title, 'movies', 'salesPitch'),
        // multiple: false,
        // docNameField: 'ref',
        // fileRefField: 'ref',
        // storagePath: `movies/${title.id}/promotional.videos.otherVideos`,
        // privacy: 'public',
        // hasFile: title.promotional.videos?.otherVideos?.length
      },
      notes: {
        name: 'Notes & Statements',
        type: 'file',
        accept: 'pdf',
        meta: ['movies', 'notes', title.id],
        form: getFormListStorage(title, 'movies', 'notes'),
        // multiple: true,
        // docNameField: 'ref',
        // fileRefField: 'ref',
        // storagePath: `movies/${title.id}/promotional.notes`,
        // privacy: 'public',
        // hasFile: title.promotional.notes.length
      }
    }
  }
}

function orgDirectory(org: Organization): Directory {
  return {
    name: 'Org',
    type: 'directory',
    icon: 'home',
    children: {
      documents: {
        name: 'Documents',
        type: 'file',
        accept: 'pdf',
        meta: ['orgs', 'notes', org.id],
        form: getFormStorage(org, 'orgs', 'notes'),
        // multiple: true,
        // docNameField: 'title',
        // fileRefField: 'ref',
        // storagePath: `orgs/${org.id}/documents.notes`,
        // privacy: 'protected',
        // hasFile: org.documents?.notes.length
      },
      logo: {
        name: 'Logo',
        type: 'image',
        ratio: 'square',
        meta: ['orgs', 'logo', org.id],
        form: getFormStorage(org, 'orgs', 'logo'),
        // multiple: false,
        // docNameField: 'logo',
        // fileRefField: 'logo',
        // storagePath: `orgs/${org.id}/logo`,
        // privacy: 'public',
        // hasFile: !!org.logo
      }
    }
  }
}

export interface RootDirectory {
  orgs: Directory;
  titles: Directory;
}

export function getDirectories(org: Organization, titles: Movie[]): Directory {
  return {
    name: 'Root',
    type: 'directory',
    children: {
      orgs: orgDirectory(org),
      titles: {
        type: 'directory',
        name: 'Titles',
        icon: 'movie',
        children: titlesDirectory(titles),
      }
    },
  }
}

