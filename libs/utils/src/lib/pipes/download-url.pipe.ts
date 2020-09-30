import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';


@Pipe({ name: 'downloadUrl' })
export class DownloadUrlPipe implements PipeTransform {
  constructor(private storage: AngularFireStorage) {}
  transform(path: string): Observable<string> {
    return this.storage.ref(path).getDownloadURL();
  }
}

@NgModule({
  declarations: [DownloadUrlPipe],
  exports: [DownloadUrlPipe]
})
export class DownloadUrlModule { }
