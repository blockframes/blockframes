import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileUploaderService } from '../../../+state';
// Material
// File Explorer
import { ImgDirectory, FileDirectory } from '../explorer.model';

@Component({
  selector: 'file-explorer-single-file-view',
  templateUrl: 'single-file-view.component.html',
  styleUrls: ['./single-file-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleFileViewComponent {
  @Input() dir: ImgDirectory | FileDirectory;

  constructor(private service: FileUploaderService) {}

  public async update() {
    this.service.upload();
  }
}
