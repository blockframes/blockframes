import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform, NgModule } from '@angular/core';

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
  declarations: [FileTypeImagePipe],
  imports: [CommonModule],
  exports: [FileTypeImagePipe]
})
export class FileTypeImagePipeModule { }
