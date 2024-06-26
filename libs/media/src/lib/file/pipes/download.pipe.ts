import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { MediaService } from '../../service';
import { StorageFile, Waterfall, WaterfallFile } from '@blockframes/model';
import { fileSizeToString } from '@blockframes/model';

@Pipe({ name: 'getUrl' })
export class GetUrlPipe implements PipeTransform {
  constructor(private service: MediaService) { }
  transform(file: StorageFile): Promise<string> {
    return this.service.generateImgIxUrl(file);
  }
}

@Pipe({ name: 'toBlob' })
export class ToBlobPipe implements PipeTransform {
  constructor(private service: MediaService, private http: HttpClient) { }
  async transform(file: StorageFile) {
    const url = await this.service.generateImgIxUrl(file);
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((blob: Blob) => URL.createObjectURL(blob))
    )
  }
}

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  /** Take size in Bytes and parse it into a human readable string */
  transform(fileSize: number) {
    return fileSizeToString(fileSize)
  }
}

@Pipe({ name: 'getFile' })
export class GetFilePipe implements PipeTransform {
  transform(contractId: string, waterfall: Waterfall): WaterfallFile {
    const file = waterfall.documents.find(f => f.id === contractId);
    return file;
  }
}

@NgModule({
  declarations: [GetUrlPipe, ToBlobPipe, FileSizePipe, GetFilePipe],
  exports: [GetUrlPipe, ToBlobPipe, FileSizePipe, GetFilePipe]
})
export class DownloadPipeModule { }
