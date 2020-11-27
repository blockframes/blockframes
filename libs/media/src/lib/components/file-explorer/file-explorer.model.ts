import { Privacy } from "@blockframes/utils/file-sanitizer";
import { FormList } from "@blockframes/utils/form";
import { MediaRatioType } from "../cropper/cropper.component";
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { isMediaForm } from "@blockframes/media/+state/media.model";
import { MovieForm, MovieNotesForm } from "@blockframes/movie/form/movie.form";
import { OrganizationForm } from "@blockframes/organization/forms/organization.form";
import { AllowedFileType } from "@blockframes/utils/utils";

type DirectoryType = 'directory' | 'file' | 'image';

interface DirectoryBase {
  type: DirectoryType;
  /** Display Name use in the UI */
  name: string;
  /** Path to this directory starting from the root array */
  path: number[];
}

export interface Directory extends DirectoryBase {
  type: 'directory';
  /** Array of sub-folders */
  directories: (Directory | SubDirectoryImage | SubDirectoryFile)[];
}

interface FileDirectoryBase extends DirectoryBase {
  /** Wether or not this directory can contain several files *(like stills photo)* or only one *(like movie poster)* */
  multiple: boolean;
  docNameField: string;
  fileRefField: string;
  /**
   * Corresponding path to the firebase storage
   * @note it **SHOULD NOT** start with a `/`
   * @note it **SHOULD NOT** end with a `/`
   * @note it **SHOULD NOT** contain the privacy (`public`/`protected`)
   * @note it **SHOULD NOT** contain the file name at the end
   */
  storagePath: string;
  privacy: Privacy;
}

export interface SubDirectoryImage extends FileDirectoryBase {
  type: 'image';
  ratio: MediaRatioType;
}

export interface SubDirectoryFile extends FileDirectoryBase {
  acceptedFileType: AllowedFileType
  type: 'file';
}

export type MediaFormList = FormList<(HostedMediaWithMetadataForm | HostedMediaForm | MovieNotesForm)[], HostedMediaWithMetadataForm | HostedMediaForm | MovieNotesForm>;
export type MediaFormTypes = HostedMediaWithMetadataForm | HostedMediaForm | MovieNotesForm;

export function getCollection(storagePath: string) {
  return storagePath.split('/')[0] as 'movies' | 'orgs';
}

export function getId(storagePath: string) {
  return storagePath.split('/')[1];
}

/**
 * Remove `collection` & `docId` from the storage path, then join path parts with a `.`
 * @example
 * getDeepPath('movies/1234/promotional/videos.screener');
 * // 'promotional.videos.screener'
 */
export function getDeepPath(storagePath: string) {
  return storagePath.split('/').splice(2).join('.');
}

export function getFormList(form: OrganizationForm | MovieForm, storagePath: string): MediaFormList {
  return getDeepPath(storagePath).split('.').reduce((res, key) => res?.controls?.[key], form);
}

export function isHostedMediaForm(form: MediaFormTypes): form is HostedMediaForm {
  return isMediaForm(form);
}

export function isHostedMediaWithMetadataForm(form: MovieNotesForm | HostedMediaWithMetadataForm): form is HostedMediaWithMetadataForm {
  return !!(form as HostedMediaWithMetadataForm).get('title');
}

export function createOrgFileStructure(orgId: string): Directory {
  return {
    name: 'Company Files',
    type: 'directory',
    path: [0],
    directories: [
      {
        name: 'Documents',
        type: 'file',
        acceptedFileType: 'pdf',
        multiple: true,
        docNameField: 'title',
        fileRefField: 'ref',
        storagePath: `orgs/${orgId}/documents.notes`,
        privacy: 'protected',
        path: [0,0]
      },
      {
        name: 'Logo',
        type: 'image',
        ratio: 'square',
        multiple: false,
        docNameField: 'logo',
        fileRefField: 'logo',
        storagePath: `orgs/${orgId}/logo`,
        privacy: 'public',
        path: [0,1]
      }
    ]
  };
}

export function createMovieFileStructure(titleId: string, titleName: string, index: number): Directory {
  return {
    name: titleName,
    type: 'directory',
    path: [index],
    directories: [
      {
        name: 'Poster & Banner',
        type: 'directory',
        path: [index, 0],
        directories: [
          {
            name: 'Poster',
            type: 'image',
            ratio: 'poster',
            multiple: false,
            docNameField: 'poster',
            fileRefField: 'poster',
            storagePath: `movies/${titleId}/poster`,
            privacy: 'public',
            path: [index, 0, 0],
          },
          {
            name: 'Banner',
            type: 'image',
            ratio: 'banner',
            multiple: false,
            docNameField: 'banner',
            fileRefField: 'banner',
            storagePath: `movies/${titleId}/banner`,
            privacy: 'public',
            path: [index, 0, 1],
          },
        ]
      },
      {
        name: 'Promotional Elements',
        type: 'directory',
        path: [index, 1],
        directories: [
          {
            name: 'Presentation Deck',
            type: 'file',
            acceptedFileType: 'pdf',
            multiple: false,
            docNameField: 'presentation_deck',
            fileRefField: 'presentation_deck',
            storagePath: `movies/${titleId}/promotional.presentation_deck`,
            privacy: 'public',
            path: [index, 1, 0],
          },
          {
            name: 'Scenario',
            type: 'file',
            acceptedFileType: 'pdf',
            multiple: false,
            docNameField: 'scenario',
            fileRefField: 'scenario',
            storagePath: `movies/${titleId}/promotional.scenario`,
            privacy: 'public',
            path: [index, 1, 1],
          },
          {
            name: 'Moodboard / Artistic Deck',
            type: 'file',
            acceptedFileType: 'pdf',
            multiple: false,
            docNameField: 'file',
            fileRefField: 'file',
            storagePath: `movies/${titleId}/promotional.moodboard`,
            privacy: 'public',
            path: [index, 1, 2],
          },
          {
            name: 'Images',
            type: 'image',
            multiple: true,
            docNameField: '',
            fileRefField: '',
            ratio: 'still',
            storagePath: `movies/${titleId}/promotional.still_photo`,
            privacy: 'public',
            path: [index, 1, 3],
          },
          {
            name: 'Screener',
            type: 'file',
            multiple: false,
            acceptedFileType: 'video',
            docNameField: 'ref',
            fileRefField: 'ref',
            storagePath: `movies/${titleId}/promotional.videos.screener`,
            privacy: 'protected',
            path: [index, 1, 4]
          },
          {
            name: 'Other Videos',
            type: 'file',
            acceptedFileType: 'video',
            multiple: true,
            docNameField: 'ref',
            fileRefField: 'ref',
            storagePath: `movies/${titleId}/promotional.videos.otherVideos`,
            privacy: 'protected',
            path: [index, 1, 5]
          }
        ]
      },
      {
        name: 'Notes & Statements',
        type: 'file',
        acceptedFileType: 'pdf',
        multiple: true,
        docNameField: 'ref',
        fileRefField: 'ref',
        storagePath: `movies/${titleId}/promotional.notes`,
        privacy: 'protected',
        path: [index, 2],
      }
    ]
  };
}
