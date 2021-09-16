import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MeetingForm } from '@blockframes/event/form/event.form';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';
import { take } from 'rxjs/operators';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog } from '@angular/material/dialog';
import { FilePickerComponent } from '@blockframes/media/file/picker/picker.component';
import { FilePreviewComponent } from '@blockframes/media/file/preview/preview.component';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: 'event-meeting-files',
  templateUrl: './meeting-files.component.html',
  styleUrls: ['./meeting-files.component.scss'],
  animations: [slideUpList('h2, mat-card')],// @TODO #5895 check
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingFilesComponent implements OnInit {

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    private shell: EventEditComponent,
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
      this.cdr.markForCheck();
    });
  }
}
