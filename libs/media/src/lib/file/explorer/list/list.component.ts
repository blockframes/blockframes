import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { FileUploaderService, MediaService } from '../../../+state';
import { ImgDirectory, FileDirectory } from '../explorer.model';
import { FilePreviewComponent } from '../../preview/preview.component';

@Component({
  selector: 'file-explorer-list',
  templateUrl: 'list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerListComponent {
  @Input() dir: ImgDirectory | FileDirectory;

  constructor(
    private service: FileUploaderService,
    private mediaService: MediaService,
    private dialog: MatDialog,
  ) {}

  public async update() {
    this.service.upload();
  }

  public openView(item: Partial<StorageFile>, event: Event) {
    event.stopPropagation();
    const ref = item.storagePath;
    if (ref) {
      this.dialog.open(FilePreviewComponent, { data: { ref }, width: '80vw', height: '80vh' });
    }
  }

  public async downloadFile(item: Partial<StorageFile>, event: Event) {
    event.stopPropagation();
    const ref = item.storagePath;
    if (ref) {
      const url = await this.mediaService.generateImgIxUrl(ref);
      window.open(url);
    }
  }

}
