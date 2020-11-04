import { Privacy } from "@blockframes/utils/file-sanitizer";
import { FormList } from "@blockframes/utils/form";
import { MediaRatioType } from "../cropper/cropper.component";
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { isMediaForm } from "@blockframes/media/+state/media.model";
import { MovieForm, MovieNotesForm } from "@blockframes/movie/form/movie.form";
import { OrganizationForm } from "@blockframes/organization/forms/organization.form";
import { AllowedFileType } from "@blockframes/utils/utils";

interface DirectoryBase {
  name: string;
  path: number[];
}

interface FileDirectoryBase {
  multiple: boolean;
  docNameField: string;
  fileRefField: string;
  storagePath: string;
  privacy: Privacy;
}

export interface Directory extends DirectoryBase {
  type: 'directory';
  collection?: 'movies' | 'orgs';
  selected?: boolean;
  directories: (Directory | SubDirectoryImage | SubDirectoryFile)[];
}

export interface SubDirectoryImage extends DirectoryBase, FileDirectoryBase {
  type: 'image';
  ratio: MediaRatioType;
}

export interface SubDirectoryFile extends DirectoryBase, FileDirectoryBase {
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
