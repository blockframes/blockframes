import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MeetingForm } from '@blockframes/event/form/event.form';
import { EventFormShellComponent } from '../shell/shell.component';
import { take } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog } from '@angular/material/dialog';
import { FilePickerComponent } from '@blockframes/media/file/picker/picker.component';
import { FilePreviewComponent } from '@blockframes/media/file/preview/preview.component';
import { StorageFile } from '@blockframes/model';

@Component({
  selector: 'event-meeting-files',
  templateUrl: './meeting-files.component.html',
  styleUrls: ['./meeting-files.component.scss'],
  host: {
    class: 'surface'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingFilesComponent implements OnInit {

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    private shell: EventFormShellComponent,
  ) { }

  get files() {
    return (this.shell.form.get('meta') as MeetingForm).get('files');
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Meeting files');
  }

  removeSelectedFile(index: number, $event: Event) {
    $event.stopPropagation();
    this.files.removeAt(index);
    this.files.markAsDirty();
  }

  previewFile(ref: StorageFile) {
    this.dialog.open(FilePreviewComponent, { data: { ref }, width: '80vw', height: '80vh', autoFocus: false })
  }

  openFileSelector() {
    this.dialog.open(FilePickerComponent, {
      width: '80%',
      height: '80%',
      disableClose: true,
      data: {
        selectedFiles: this.files.value,
      }
    }).afterClosed().pipe(take(1)).subscribe(result => {
      this.files.patchAllValue(result);
      this.files.markAsDirty();
      this.cdr.markForCheck();
    });
  }
}
