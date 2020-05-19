
export type UploadState = 'waiting' | 'hovering' | 'uploading' | 'success';

export interface UnloadComponent {
  canUnload: () => boolean;
}
