import { Privacy } from "@blockframes/utils/file-sanitizer";
import { FormList } from "@blockframes/utils/form";
import { MediaRatioType } from '../../image/uploader/uploader.component';
// import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
// import { HostedMediaForm } from '@blockframes/media/form/media.form';
// import { isMediaForm } from "@blockframes/media/+state/media.model";
import { MovieForm, MovieNotesForm } from "@blockframes/movie/form/movie.form";
import { OrganizationForm } from "@blockframes/organization/forms/organization.form";
import { AllowedFileType } from "@blockframes/utils/utils";
import { Movie } from "@blockframes/movie/+state";
import { Organization } from "@blockframes/organization/+state/organization.model";

import { StorageFile } from '../../+state/media.firestore';


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

export interface ImgDirectory extends FileDirectoryBase {
  type: 'image';
  ratio: MediaRatioType;
}

export interface FileDirectory extends FileDirectoryBase {
  type: 'file';
  accept: AllowedFileType
}


export function getCollection(file: StorageFile) {
  return file.collection;
}

export function getId(file: StorageFile) {
  return file.docId;
}

export function getDeepPath(file: StorageFile) {
  return file.field;
}

export function getFormList(form: OrganizationForm | MovieForm, file: StorageFile) {
  return file.field.split('.').reduce((res, key) => res?.controls?.[key], form);
}

function titlesDirectory(titles: Movie[]) {
  const documents = {};
  for (const title of titles) {
    document[title.id] = titleDirectory(title);
  }
  return documents;
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
        multiple: false,
        docNameField: 'poster',
        fileRefField: 'poster',
        storagePath: `movies/${title.id}/poster`,
        privacy: 'public',
        hasFile: !!title.poster
      },
      banner: {
        name: 'Banner',
        type: 'image',
        ratio: 'banner',
        multiple: false,
        docNameField: 'banner',
        fileRefField: 'banner',
        storagePath: `movies/${title.id}/banner`,
        privacy: 'public',
        hasFile: !!title.banner
      },
      scenario: {
        name: 'Scenario',
        type: 'file',
        accept: 'pdf',
        multiple: false,
        docNameField: 'scenario',
        fileRefField: 'scenario',
        storagePath: `movies/${title.id}/promotional.scenario`,
        privacy: 'public',
        hasFile: !!title.promotional.scenario
      },
      moodboard: {
        name: 'Moodboard / Artistic Deck',
        type: 'file',
        accept: 'pdf',
        multiple: false,
        docNameField: 'file',
        fileRefField: 'file',
        storagePath: `movies/${title.id}/promotional.moodboard`,
        privacy: 'public',
        hasFile: !!title.promotional.moodboard
      },
      'presentation_deck': {
        name: 'Presentation Deck',
        type: 'file',
        accept: 'pdf',
        multiple: false,
        docNameField: 'presentation_deck',
        fileRefField: 'presentation_deck',
        storagePath: `movies/${title.id}/promotional.presentation_deck`,
        privacy: 'public',
        hasFile: !!title.promotional.presentation_deck
      },
      'still_photo': {
        name: 'Images',
        type: 'image',
        multiple: true,
        docNameField: '',
        fileRefField: '',
        ratio: 'still',
        storagePath: `movies/${title.id}/promotional.still_photo`,
        privacy: 'public',
        hasFile: title.promotional.still_photo.length
      },
      screener: {
        name: 'Screener',
        type: 'file',
        multiple: false,
        accept: 'video',
        docNameField: 'ref',
        fileRefField: 'ref',
        storagePath: `movies/${title.id}/promotional.videos.screener`,
        privacy: 'protected',
        hasFile: !!title.promotional.videos?.screener?.ref
      },
      otherVideo: {
        name: 'Other Videos',
        type: 'file',
        accept: 'video',
        multiple: true,
        docNameField: 'ref',
        fileRefField: 'ref',
        storagePath: `movies/${title.id}/promotional.videos.otherVideos`,
        privacy: 'public',
        hasFile: title.promotional.videos?.otherVideos?.length
      },
      salesPitch: {
        name: 'Sales Pitch',
        type: 'file',
        accept: 'video',
        multiple: false,
        docNameField: 'ref',
        fileRefField: 'ref',
        storagePath: `movies/${title.id}/promotional.videos.otherVideos`,
        privacy: 'public',
        hasFile: title.promotional.videos?.otherVideos?.length
      },
      notes: {
        name: 'Notes & Statements',
        type: 'file',
        accept: 'pdf',
        multiple: true,
        docNameField: 'ref',
        fileRefField: 'ref',
        storagePath: `movies/${title.id}/promotional.notes`,
        privacy: 'public',
        hasFile: title.promotional.notes.length
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
        multiple: true,
        docNameField: 'title',
        fileRefField: 'ref',
        storagePath: `orgs/${org.id}/documents.notes`,
        privacy: 'protected',
        hasFile: org.documents?.notes.length
      },
      logo:       {
        name: 'Logo',
        type: 'image',
        ratio: 'square',
        multiple: false,
        docNameField: 'logo',
        fileRefField: 'logo',
        storagePath: `orgs/${org.id}/logo`,
        privacy: 'public',
        hasFile: !!org.logo
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

