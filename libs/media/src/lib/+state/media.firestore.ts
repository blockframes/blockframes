
export interface ExternalMedia {
  /** access url */
  url: string;
}

export function createExternalMedia(media?: Partial<ExternalMedia>): ExternalMedia {
  return {
    url: '',
    ...media,
  }
}

export interface HostedMedia extends ExternalMedia {
  /** firebase storage ref *(path)* */
  ref: string;
}

export interface HostedMediaFormValue extends HostedMedia {
  oldRef: string;
  blobOrFile: Blob | File;
  delete: boolean;
  fileName: string;
}

export function clearHostedMediaFormValue(formValue: HostedMediaFormValue): HostedMedia {
  return {
    url: formValue.url || '',
    ref: formValue.oldRef || '', // we don't want the new ref witch is maybe not yet uploaded
  };
}

export function createHostedMedia(media?: Partial<HostedMedia>): HostedMedia {
  return {
    url: '',
    ref: '',
    ...media,
  }
}

export interface UploadData {
  /**
  * firebase storage upload path *(or ref)*,
  * @note **Make sure that the path param does not include the filename.**
  * @note **Make sure that the path ends with a `/`.**
  */
  path: string,
  data: Blob | File,
  fileName: string,
}
