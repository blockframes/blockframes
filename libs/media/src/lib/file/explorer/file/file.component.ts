import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileUploaderService } from '../../../+state';
import { ImgDirectory, FileDirectory } from '../explorer.model';

@Component({
  selector: 'file-explorer-file',
  templateUrl: 'file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerFileComponent {
  @Input() dir: ImgDirectory | FileDirectory;

  constructor(private service: FileUploaderService) {}

  public async update() {
    this.service.upload();
  }
}
