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
  type: 'directory' | 'file' | 'image' | 'fileList' | 'imageList';
  /** Display Name use in the UI */
  name: string;
}

export interface Directory extends DirectoryBase {
  type: 'directory';
  icon?: string;
  /** Array of sub-folders */
  children: Record<string, (Directory | FileDirectory | ImgDirectory | FileListDirectory | ImgListDirectory)>;
}

export interface FileDirectoryBase extends DirectoryBase {
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

interface ImgDirectory extends FileDirectoryBase {
  type: 'image';
  ratio: MediaRatioType;
  form: StorageFileForm | FormList<StorageFile>;
}

interface FileDirectory extends FileDirectoryBase {
  type: 'file';
  accept: AllowedFileType;
  form: StorageFileForm | FormList<StorageFile>;
}

interface FileListDirectory extends FileDirectoryBase {
  type: 'fileList',
  form: FormList<StorageFile>;
  accept: AllowedFileType;
}

interface ImgListDirectory extends FileDirectoryBase {
  type: 'imageList',
  form: FormList<StorageFile>;
  ratio: MediaRatioType;
  accept: AllowedFileType;
}

export function getFormList(form: OrganizationForm | MovieForm, field: string) {
  return field.split('.').reduce((res, key) => res?.controls?.[key], form);
}

function titlesDirectory(titles: Movie[]) {
  const documents = {};
  for (const title of titles) {
    documents[title.id] = titleDirectory(title);
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
      },
      banner: {
        name: 'Banner',
        type: 'image',
        ratio: 'banner',
        meta: ['movies', 'banner', title.id],
        form: getFormStorage(title, 'movies', 'banner'),
      },
      scenario: {
        name: 'Scenario',
        type: 'file',
        accept: 'pdf',
        meta: ['movies', 'scenario', title.id],
        form: getFormStorage(title, 'movies', 'scenario'),
      },
      moodboard: {
        name: 'Moodboard / Artistic Deck',
        type: 'file',
        accept: 'pdf',
        meta: ['movies', 'moodboard', title.id],
        form: getFormStorage(title, 'movies', 'moodboard'),
      },
      'presentation_deck': {
        name: 'Presentation Deck',
        type: 'file',
        accept: 'pdf',
        meta: ['movies', 'presentation_deck', title.id],
        form: getFormStorage(title, 'movies', 'presentation_deck'),
      },
      'still_photo': {
        name: 'Images',
        type: 'imageList',
        accept: 'image',
        ratio: 'still',
        meta: ['movies', 'still_photo', title.id],
        form: getFormListStorage(title, 'movies', 'still_photo'),
      },
      screener: {
        name: 'Screener',
        type: 'file',
        accept: 'video',
        meta: ['movies', 'screener', title.id],
        form: getFormStorage(title, 'movies', 'screener'),
      },
      otherVideos: {
        name: 'Other Videos',
        type: 'fileList',
        accept: 'video',
        meta: ['movies', 'otherVideos', title.id],
        form: getFormListStorage(title, 'movies', 'otherVideos'),
      },
      salesPitch: {
        name: 'Sales Pitch',
        type: 'file',
        accept: 'video',
        meta: ['movies', 'salesPitch', title.id],
        form: getFormStorage(title, 'movies', 'salesPitch'),
      },
      notes: {
        name: 'Notes & Statements',
        type: 'fileList',
        accept: 'pdf',
        meta: ['movies', 'notes', title.id],
        form: getFormListStorage(title, 'movies', 'notes'),
      }
    }
  }
}

function orgDirectory(org: Organization): Directory {
  return {
    name: 'Company',
    type: 'directory',
    icon: 'home',
    children: {
      documents: {
        name: 'Documents',
        type: 'fileList',
        accept: 'pdf',
        meta: ['orgs', 'notes', org.id],
        form: getFormListStorage(org, 'orgs', 'notes'),
      },
      logo: {
        name: 'Logo',
        type: 'image',
        ratio: 'square',
        meta: ['orgs', 'logo', org.id],
        form: getFormStorage(org, 'orgs', 'logo'),
      }
    }
  }
}

export interface RootDirectory {
  org: Directory;
  titles: Directory;
}

export function getDirectories(org: Organization, titles: Movie[]): Directory {
  return {
    name: 'Root',
    type: 'directory',
    children: {
      org: orgDirectory(org),
      titles: {
        type: 'directory',
        name: 'Titles',
        icon: 'movie',
        children: titlesDirectory(titles),
      }
    },
  }
}

