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

@Pipe({
  name: 'fileTypeImage'
})
export class FileTypeImagePipe implements PipeTransform {
  transform(file: string): string {
    const type = file.split('.').pop();
    switch (type) {
      case 'docx':
      case 'doc':
        return 'docx.webp';
      case 'xls':
      case 'xlsx':
        return 'xls.webp';
      case 'png':
      case 'webp':
      case 'jpg':
        return 'image.webp';
      case 'pdf':
        return 'pdf.webp';
      default:
        return 'image.webp';
    }
  }
}

@NgModule({
  exports: [FileNamePipe, FileTypePipe, FileTypeImagePipe],
  declarations: [FileNamePipe, FileTypePipe, FileTypeImagePipe],
})
export class FileNameModule { }
