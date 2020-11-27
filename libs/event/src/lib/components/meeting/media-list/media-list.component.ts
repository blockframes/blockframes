import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Event, EventService } from '@blockframes/event/+state';
import { Meeting } from '@blockframes/event/+state/event.firestore';
import { EventForm, MeetingForm } from '@blockframes/event/form/event.form';

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
}
