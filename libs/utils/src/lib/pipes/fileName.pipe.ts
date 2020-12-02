import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { getFileExtension } from '../file-sanitizer';
import { extensionToType, titleCase } from '../utils';

@Pipe({ name: 'fileName' })
export class FileNamePipe implements PipeTransform {
  transform(file: string) {
    if (!file) return '';
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
    const folder = getFileFolder(subFolders.split('.').pop());

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

export const getFileFolder = (folder: string) => {
  switch (folder) {
    case 'notes':
      return 'Note'
    case 'still_photo':
      return 'Image' 
    case 'otherVideos':
      return 'Video'
    case 'presentation_deck':
      return 'Presentation deck'
    default:
      return titleCase(folder);
  }
}

/**
 * Returns the name of the folder where the file is stored
 * e.g. orgs/id/documents.notes/abc.pdf => Note
 * movie/promotional/screener/abc.mp4 => Screener
 */
@Pipe({ name: 'fileFolder' })
export class FileFolderPipe implements PipeTransform {
  transform(filePath: string) {
    const segments = filePath.split('/')
    segments.pop();
    const field = segments.pop();
    const folder = field.split('.').pop();

    return getFileFolder(folder);
  }
}

@NgModule({
  exports: [FileNamePipe, FileTypePipe, FileTypeImagePipe, FilePathPipe, FileFolderPipe],
  declarations: [FileNamePipe, FileTypePipe, FileTypeImagePipe, FilePathPipe, FileFolderPipe],
})
export class FileNameModule { }
