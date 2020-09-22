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

  private _event: Event<Meeting>;

  editPage: string;

  get event() {
    return this._event;
  }
  @Input() set event(value: Event<Meeting>) {
    this._event = value;
    this.editPage = `/c/o/dashboard/event/${this.event.id}/edit`
  }

  constructor(
    private eventService: EventService
  ) { }

  isSelected(file: string) {
    return this.event.meta.selectedFile === file;
  }

  select(file: string) {
    this.event.meta.selectedFile = file;
    this.eventService.update(this.event);
  }
}
