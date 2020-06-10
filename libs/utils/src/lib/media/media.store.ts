import { Injectable } from '@angular/core';
import { StoreConfig, EntityStore, EntityState } from '@datorama/akita';

export type UploadStatus = 'uploading' | 'paused' | 'succeeded' | 'canceled';

export interface UploadState {
  status: UploadStatus;
  progress: number;
}

export interface MediaState extends EntityState<UploadState> {
}

const initialState: MediaState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'uploads' })
export class MediaStore extends EntityStore<MediaState, UploadState> {
  constructor() {
    super(initialState);
  }
}
