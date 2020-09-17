
export interface HostedMediaFormValue {
  ref: string;
  oldRef: string;
  blobOrFile: Blob | File;
  fileName: string;
}

export function clearHostedMediaFormValue(formValue: HostedMediaFormValue): string {
  if (formValue.ref === '') { return ''; }
  const ref = formValue.ref;
  const refParts = ref.split('/');
  return refParts.pop() === formValue.fileName ?
    `${formValue.ref}` :
    `${formValue.ref}/${formValue.fileName}`;
}

export interface UploadData {
  /**
  * firebase storage upload path *(or ref)*,
  * @note **Make sure that the path param does not include the filename.**
  * @note **Make sure that the path does not ends with a `/`.**
  */
  path: string,
  data: Blob | File,
  fileName: string,
}
