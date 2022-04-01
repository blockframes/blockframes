import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { StorageFile } from '@blockframes/shared/model';

@Pipe({ name: 'fileListIndex' })
export class FileListIndexPipe implements PipeTransform {

  transform(index: number, list: StorageFile[]): number | undefined {
    if (index === undefined || index === null || !list || !Array.isArray(list)) {
      console.warn('Wrong arguments in pipe "fileListIndex", expected number and StorageFile[] but got', JSON.stringify(index), JSON.stringify(list));
      return;
    }

    const nonEmptyCount = list.reduce((acc, file) => {
      if (file.storagePath) return acc + 1;
      return acc;
    }, 0);

    const indexInUploaderQueue = index - nonEmptyCount;
    if (indexInUploaderQueue >= 0) return indexInUploaderQueue;
    return;
  }

}

@NgModule({
  declarations: [FileListIndexPipe],
  exports: [FileListIndexPipe]
})
export class FileListPipeModule { }
