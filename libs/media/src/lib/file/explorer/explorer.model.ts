import { Privacy } from "@blockframes/utils/file-sanitizer";
import { FormList } from "@blockframes/utils/form";
import { MediaRatioType } from "../../components/cropper/cropper.component";
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { isMediaForm } from "@blockframes/media/+state/media.model";
import { MovieForm, MovieNotesForm } from "@blockframes/movie/form/movie.form";
import { OrganizationForm } from "@blockframes/organization/forms/organization.form";
import { AllowedFileType } from "@blockframes/utils/utils";
import { Movie } from "@blockframes/movie/+state";
import { OrganizationDocumentWithDates } from "@blockframes/organization/+state/organization.firestore";

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
  hasFile: boolean | number;
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

export function createOrgFileStructure(org: OrganizationDocumentWithDates): Directory {
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
        storagePath: `orgs/${org.id}/documents.notes`,
        privacy: 'protected',
        path: [0,0],
        hasFile: org.documents?.notes.length
      },
      {
        name: 'Logo',
        type: 'image',
        ratio: 'square',
        multiple: false,
        docNameField: 'logo',
        fileRefField: 'logo',
        storagePath: `orgs/${org.id}/logo`,
        privacy: 'public',
        path: [0,1],
        hasFile: !!org.logo
      }
    ]
  };
}

export function createMovieFileStructure(title: Movie, index: number): Directory {
  return {
    name: title.title.international,
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
            storagePath: `movies/${title.id}/poster`,
            privacy: 'public',
            path: [index, 0, 0],
            hasFile: !!title.poster
          },
          {
            name: 'Banner',
            type: 'image',
            ratio: 'banner',
            multiple: false,
            docNameField: 'banner',
            fileRefField: 'banner',
            storagePath: `movies/${title.id}/banner`,
            privacy: 'public',
            path: [index, 0, 1],
            hasFile: !!title.banner
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
            storagePath: `movies/${title.id}/promotional.presentation_deck`,
            privacy: 'public',
            path: [index, 1, 0],
            hasFile: !!title.promotional.presentation_deck
          },
          {
            name: 'Scenario',
            type: 'file',
            acceptedFileType: 'pdf',
            multiple: false,
            docNameField: 'scenario',
            fileRefField: 'scenario',
            storagePath: `movies/${title.id}/promotional.scenario`,
            privacy: 'public',
            path: [index, 1, 1],
            hasFile: !!title.promotional.scenario
          },
          {
            name: 'Moodboard / Artistic Deck',
            type: 'file',
            acceptedFileType: 'pdf',
            multiple: false,
            docNameField: 'file',
            fileRefField: 'file',
            storagePath: `movies/${title.id}/promotional.moodboard`,
            privacy: 'public',
            path: [index, 1, 2],
            hasFile: !!title.promotional.moodboard
          },
          {
            name: 'Images',
            type: 'image',
            multiple: true,
            docNameField: '',
            fileRefField: '',
            ratio: 'still',
            storagePath: `movies/${title.id}/promotional.still_photo`,
            privacy: 'public',
            path: [index, 1, 3],
            hasFile: title.promotional.still_photo.length
          },
          {
            name: 'Screener',
            type: 'file',
            multiple: false,
            acceptedFileType: 'video',
            docNameField: 'ref',
            fileRefField: 'ref',
            storagePath: `movies/${title.id}/promotional.videos.screener`,
            privacy: 'protected',
            path: [index, 1, 4],
            hasFile: !!title.promotional.videos?.screener?.ref
          },
          {
            name: 'Other Videos',
            type: 'file',
            acceptedFileType: 'video',
            multiple: true,
            docNameField: 'ref',
            fileRefField: 'ref',
            storagePath: `movies/${title.id}/promotional.videos.otherVideos`,
            privacy: 'public',
            path: [index, 1, 5],
            hasFile: title.promotional.videos?.otherVideos?.length
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
        storagePath: `movies/${title.id}/promotional.notes`,
        privacy: 'public',
        path: [index, 2],
        hasFile: title.promotional.notes.length
      }
    ]
  };
}
