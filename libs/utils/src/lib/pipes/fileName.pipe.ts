import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { getFileExtension } from '../file-sanitizer';
import { extensionToType, titleCase } from '../utils';

@Pipe({ name: 'fileName' })
export class FileNamePipe implements PipeTransform {

  /**
   * Returns the name of the file
   * e.g. org/id/logo/abc.jpg => 'abc.jpg'
   */
  transform(filePath: string) {
    if (!filePath) return '';
    if (typeof filePath !== 'string') {
      console.warn('UNEXPECTED FILE', filePath);
      console.warn('This pipe require a string as input');
      return '';
    }
    const arrayedRef = filePath.split('/');
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

  /**
   * Returns a readable version of the file path
   * e.g. org/id/documents.notes/abc.jpg => 'Organization > Cascade8 > Note > abc.jpg'
   */
  async transform(file: StorageFile, separator = '/') {
    if (!file) return '';
    if (typeof file !== 'object') {
      console.warn('UNEXPECTED FILE', file);
      console.warn('This pipe require a StorageFile as input');
      return '';
    }

    const folder = getFileFolder(file.field);
    let collection: string = file.collection;
    let docName = file.docId;
    if (collection === 'movies') {
      collection = 'Movie';
      const movie = await this.movieService.getValue(file.docId);
      docName = movie?.title?.original ?? 'Unknown Movie';
    } else if (collection === 'orgs') {
      collection = 'Organization';
      const org = await this.orgService.getValue(file.docId);
      docName = org?.denomination?.public ?? 'Unknown Organization';
    } else if (collection === 'users') {
      collection = 'User';
      const user = await this.userService.getValue(file.docId);
      docName = `${user?.firstName} ${user?.lastName}`;
    }

    const fileName = file.storagePath.split('/').pop();
    return [collection, docName, folder, fileName].join(separator);
  }
}

@Pipe({
  name: 'fileType'
})
export class FileTypePipe implements PipeTransform {

  /**
   * Returns the type of the file
   * e.g. abc.jpg => 'image'
   */
  transform(fileName: string) {
    if (!fileName) return 'unknown';
    if (typeof fileName !== 'string') {
      console.warn('UNEXPECTED FILE', fileName);
      console.warn('This pipe require a string as input');
      return 'unknown';
    }

    const extension = getFileExtension(fileName);
    return extensionToType(extension);
  }
}

@Pipe({
  name: 'fileTypeImage'
})
export class FileTypeImagePipe implements PipeTransform {

  /**
   * Returns the image or icon path for type of file
   * e.g. abc.jpg => 'image.svg' for image or 'picture' for icon
   */
  transform(fileName: string, kind: 'image' | 'icon' = 'image'): string {

    if (!fileName) return kind === 'image' ? 'image.svg' : 'document';
    if (typeof fileName !== 'string') {
      console.warn('UNEXPECTED FILE', fileName);
      console.warn('This pipe require a string as input');
      return kind === 'image' ? 'image.svg' : 'document';
    }

    const extension = getFileExtension(fileName);
    const type = extensionToType(extension);

    switch (type) {
      case 'docx':
        return kind === 'image' ? 'docx.svg' : 'document';
      case 'xls':
        return kind === 'image' ? 'xls.svg' : 'document';
      case 'image':
        return kind === 'image' ? 'image.svg' : 'image' ;
      case 'pdf':
        return kind === 'image' ? 'pdf.svg' : 'pdf';
      case 'video':
        return kind === 'image' ? 'image.svg' : 'movie';
      default:
        return kind === 'image' ? 'image.svg' : 'document';
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

@Pipe({ name: 'fileFolder' })
export class FileFolderPipe implements PipeTransform {

  /**
   * Returns the name of the folder where the file is stored
   * e.g. orgs/id/documents.notes/abc.pdf => 'Note'
   * movie/promotional/screener/abc.mp4 => 'Screener'
   */
  transform(filePath: string) {
    if (!filePath) return 'Unknown';
    if (typeof filePath !== 'string') {
      console.warn('UNEXPECTED FILE', filePath);
      console.warn('This pipe require a string as input');
      return 'Unknown';
    }

    const segments = filePath.split('/')
    segments.pop();
    const field = segments.pop();
    const folder = field.split('.').pop();

    return getFileFolder(folder);
  }
}

@Pipe({ name: 'selectedFile' })
export class SelectedFilePipe implements PipeTransform {

  /**
   * Retrieve the selected file of a Meeting form its file array
   */
  transform(files: StorageFile[], selected: string) {
    if (!selected) return;
    return files.find(file => file.storagePath === selected);
  }
}

@NgModule({
  exports: [FileNamePipe, FileTypePipe, FileTypeImagePipe, FilePathPipe, FileFolderPipe, SelectedFilePipe],
  declarations: [FileNamePipe, FileTypePipe, FileTypeImagePipe, FilePathPipe, FileFolderPipe, SelectedFilePipe],
})
export class FileNameModule { }
