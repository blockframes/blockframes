import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HostedMediaForm } from '../form/media.form';


@Pipe({ name: 'getMediaUrl' })
export class GetMediaUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(form: HostedMediaForm) {
    const { blobOrFile, ref } = form.value;
    if (blobOrFile) {
      const blobUrl = URL.createObjectURL(form.blobOrFile.value);
      return this.sanitizer.bypassSecurityTrustUrl(blobUrl);
    } else {
      return ref;
    }
  }
}


@NgModule({
  declarations: [GetMediaUrlPipe],
  imports: [CommonModule],
  exports: [GetMediaUrlPipe]
})
export class GetMediaUrlModule { }
