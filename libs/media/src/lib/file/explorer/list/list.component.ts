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
    if (item) {
      this.dialog.open(FilePreviewComponent, { data: { ref: item }, width: '80vw', height: '80vh' });
    }
  }

  public async downloadFile(item: StorageFile, event: Event) {
    event.stopPropagation();
    const url = await this.mediaService.generateImgIxUrl(item);
    window.open(url);
  }

}
