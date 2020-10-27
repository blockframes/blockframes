import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { getFileExtension } from '../file-sanitizer';
import { extensionToType } from '../utils';

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

@Pipe({ name: 'filePath' })
export class FilePathPipe implements PipeTransform {

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private userService: UserService,
  ) {}

  async transform(file: string, separator = '/') {
    if (typeof file !== 'string') {
      console.warn('UNEXPECTED FILE', file);
      console.warn('This pipe require a string as input');
      return '';
    }
    const arrayedRef = file.split('/');
    if (arrayedRef.length < 5) {
      console.warn('MALFORMED FILE PATH', file);
      console.warn('Path should be formed of <privacy>/<collection>/<ID>/<folders>/<fileName>');
      return '';
    }
    let collection = arrayedRef[1];
    const docId = arrayedRef[2];
    const fileName = arrayedRef.pop();
    const subFolders = arrayedRef.pop();
    const folder = subFolders.split('.').pop();

    let docName = docId;
    if (collection === 'movies') {
      collection = 'Movie';
      const movie = await this.movieService.getValue(docId);
      docName = movie?.title?.original ?? 'Unknown Movie';
    } else if (collection === 'orgs') {
      collection = 'Organization';
      const org = await this.orgService.getValue(docId);
      docName = org?.denomination?.public ?? 'Unknown Organization';
    } else if (collection === 'users') {
      collection = 'User';
      const user = await this.userService.getValue(docId);
      docName = `${user?.firstName} ${user?.lastName}`;
    }

    return [collection, docName, folder, fileName].join(separator);
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
    return extensionToType(extension);
  }
}

@Pipe({
  name: 'fileTypeImage'
})
export class FileTypeImagePipe implements PipeTransform {
  transform(file: string, kind: 'image' | 'icon' = 'image'): string {

    if (typeof file !== 'string') {
      console.warn('UNEXPECTED FILE', file);
      console.warn('This pipe require a string as input');
      return kind === 'image' ? 'image.webp' : 'document';
    }

    const extension = getFileExtension(file);
    const type = extensionToType(extension);

    switch (type) {
      case 'docx':
        return kind === 'image' ? 'docx.webp' : 'document';
      case 'xls':
        return kind === 'image' ? 'xls.webp' : 'document';
      case 'image':
        return kind === 'image' ? 'image.webp' : 'picture' ;
      case 'pdf':
        return kind === 'image' ? 'pdf.webp' : 'pdf';
      case 'video':
        return kind === 'image' ? 'image.webp' : 'film';
      default:
        return kind === 'image' ? 'image.webp' : 'document';
    }
  }
}

@NgModule({
  exports: [FileNamePipe, FileTypePipe, FileTypeImagePipe, FilePathPipe],
  declarations: [FileNamePipe, FileTypePipe, FileTypeImagePipe, FilePathPipe],
})
export class FileNameModule { }
