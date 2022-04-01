import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/shared/model';
import { FilePickerComponent } from '../picker/picker.component';

@Component({
  selector: '[files] file-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileCarouselComponent {
  /** Array of file path to display in the Carousel */
  @Input() files: StorageFile[];

  @Input() selectedFile: string;

  /** Emit the file path that has been selected by the user */
  @Output() selectPath = new EventEmitter<string>();

  /** Emit the new files list (array) that has been picked by the user */
  @Output() picked = new EventEmitter<string[]>();

  constructor(private dialog: MatDialog) {}

  isSelected(file: string) {
    return this.selectedFile === file;
  }

  selectFile(file: string) {
    this.selectedFile = file;
    this.selectPath.emit(file);
  }

  openFileSelector() {
    this.dialog
      .open(FilePickerComponent, {
        width: '80%',
        height: '80%',
        disableClose: true,
        data: {
          selectedFiles: this.files,
        },
      })
      .afterClosed()
      .subscribe((result: string[]) => {
        this.picked.emit(result);
      });
  }
}
