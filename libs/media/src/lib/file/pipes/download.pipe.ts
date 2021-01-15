import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { MediaService } from '../../+state/media.service';


@Pipe({ name: 'getUrl' })
export class GetUrlPipe implements PipeTransform {
  constructor(private service: MediaService) {}
  transform(path: string): Promise<string> {
    return this.service.generateImgIxUrl(path);
  }
}

@Pipe({ name: 'toBlob' })
export class ToBlobPipe implements PipeTransform {
  constructor(private service: MediaService, private http: HttpClient) {}
  async transform(path: string) {
    const url = await this.service.generateImgIxUrl(path);
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
