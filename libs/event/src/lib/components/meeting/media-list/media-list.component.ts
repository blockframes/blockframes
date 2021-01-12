import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FilePickerComponent } from '@blockframes/media/file/picker/picker.component';
import { Event, EventService } from '@blockframes/event/+state';
import { Meeting } from '@blockframes/event/+state/event.firestore';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

@Component({
  selector: '[event] event-meeting-media-list',
  templateUrl: './media-list.component.html',
  styleUrls: ['./media-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingMediaListComponent {

  editPage: string;

  @Input() event: Event<Meeting>;

  constructor(
    private dialog: MatDialog,
    private eventService: EventService
  ) { }

  isSelected(file: string) {
    return this.event.meta.selectedFile === file;
  }

  select(file: string) {
    const meta = { ...this.event.meta };
    meta.selectedFile = file;
    this.eventService.update(this.event.id, { meta });
  }

  stop() {
    const meta = { ...this.event.meta };
    meta.selectedFile = '';
    this.eventService.update(this.event.id, { meta });
  }

  openFileSelector() {
    this.dialog.open(FilePickerComponent, {
      width: '80%',
      height: '80%',
      disableClose: true,
      data: {
        selectedFiles: this.event.meta.files,
      }
    }).afterClosed().pipe(take(1)).subscribe(result => {
      const meta = { ...this.event.meta };
      meta.files = result;
      this.eventService.update(this.event.id, { meta })
    });
  }
}
