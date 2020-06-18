import { QueryEntity } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { UploadState, MediaState, MediaStore, isUploading } from './media.store';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MediaQuery extends QueryEntity<MediaState, UploadState> {
  constructor(protected store: MediaStore) {
    super(store);
  }

  isUploading(fileName: string) {
    const exists = this.hasEntity(fileName);
    if (exists) {
      const upload = this.getEntity(fileName);
      return isUploading(upload);
    } else {
      return false;
    }
  }

  isUploading$(fileName) {
    return this.select(fileName).pipe(map(upload => isUploading(upload)));
  }

  hasUploadingFiles$() {
    return this.selectAll({ filterBy: upload => isUploading(upload) }).pipe(map(list => !!list.length));
  }

}
