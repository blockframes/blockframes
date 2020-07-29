
export interface HostedMediaFormValue {
  ref: string;
  oldRef: string;
  blobOrFile: Blob | File;
  delete: boolean;
  fileName: string;
}

export function clearHostedMediaFormValue(formValue: HostedMediaFormValue) {
  return formValue.oldRef || ''; // we don't want the new ref witch is maybe not yet uploaded
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
