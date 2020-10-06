import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { getFileExtension } from '../file-sanitizer';
import { isAllowedVideoFileExtension } from '../utils';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {
  transform(file: string) {
    if (typeof file !== 'string') {
      console.warn('UNEXPECTED FILE', file);
      console.warn('This pipe require a string as input');
      return '';
    }
    const arrayedRef = file.split('/');
    return arrayedRef.pop();
  }
}

@Pipe({
  name: 'fileType'
})
export class FileTypePipe implements PipeTransform {
  transform(file: string) {
    if (typeof file !== 'string') {
      console.warn('UNEXPECTED FILE', file);
      console.warn('This pipe require a string as input');
      return 'unknown';
    }

    const extension = getFileExtension(file);

    switch(extension) {
      case 'pdf':
        return 'pdf';
      case 'webp':
      case 'png':
      case 'jpg':
      case 'bmp':
        return 'image';
      default:
        if (isAllowedVideoFileExtension(`.${extension}`)) return 'video'
        return 'unknown';
    }
  }
}

@NgModule({
  exports: [FileNamePipe, FileTypePipe],
  declarations: [FileNamePipe, FileTypePipe],
})
export class FileNameModule { }
