import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

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

    const arrayedRef = file.split('.');
    const extension = arrayedRef.pop();

    switch(extension) {
      case 'pdf':
        return 'pdf';
      case 'webp':
      case 'png':
      case 'jpg':
      case 'bmp':
        return 'image';
      case 'mp4':
      case 'avi':
      case 'mpeg':
      case 'mkv':
        return 'video';
      default:
        return 'unknown';
    }
  }
}

@NgModule({
  exports: [FileNamePipe, FileTypePipe],
  declarations: [FileNamePipe, FileTypePipe],
})
export class FileNameModule { }
