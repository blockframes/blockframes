import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { HostedMedia } from '@blockframes/media/+state/media.firestore';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {
  transform(file: HostedMedia | string) {
    const arrayedRef = typeof file === 'string' ? file.split('/') : file.ref.split('/');
    return arrayedRef.pop();
  }
}

@NgModule({
  exports: [FileNamePipe],
  declarations: [FileNamePipe],
})
export class FileNameModule { }
