import { QueryEntity } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { UploadState, MediaState, MediaStore } from './media.store';

@Injectable({
  providedIn: 'root'
})
export class MediaQuery extends QueryEntity<MediaState, UploadState> {
  constructor(protected store: MediaStore) {
    super(store);
  }

  isUploading(fileName: string) {
    const upload = this.getEntity(fileName);
    if (!!upload && (upload.status === 'uploading' || upload.status === 'paused')) {
      return true;
    }
    return false;
  }

}
