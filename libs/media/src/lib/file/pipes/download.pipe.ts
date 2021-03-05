import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { MediaService } from '../../+state/media.service';
import { StorageFile } from '@blockframes/media/+state/media.firestore';


@Pipe({ name: 'getUrl' })
export class GetUrlPipe implements PipeTransform {
  constructor(private service: MediaService) {}
  transform(file: StorageFile): Promise<string> {
    return this.service.generateImgIxUrl(file);
  }
}

@Pipe({ name: 'toBlob' })
export class ToBlobPipe implements PipeTransform {
  constructor(private service: MediaService, private http: HttpClient) {}
  async transform(file: StorageFile) {
    const url = await this.service.generateImgIxUrl(file);
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((blob: Blob) => URL.createObjectURL(blob))
    )
  }
}

@NgModule({
  declarations: [GetUrlPipe, ToBlobPipe],
  exports: [GetUrlPipe, ToBlobPipe]
})
export class DownloadPipeModule { }
