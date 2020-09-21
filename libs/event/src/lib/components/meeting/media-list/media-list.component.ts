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

  form: EventForm;

  get event() {
    return this._event;
  }
  @Input() set event(value: Event<Meeting>) {
    this._event = value;
    this.form = new EventForm(this._event);
  }

  constructor(
    private eventService: EventService
  ) { }

  editPage(eventId: string) {
    return `/c/o/dashboard/event/${eventId}/edit`;
  }

  isSelected(file: string) {
    return this.event.meta.selectedFile === file;
  }

  select(file: string) {
    const meetingMetaForm = this.form.get('meta');

    if ('files' in meetingMetaForm.value) {
      (meetingMetaForm as MeetingForm).selectedFile.setValue(file);
      if (this.form.valid) {
        const value = this.form.value;
        this.eventService.update(value);
        this.form.markAsPristine();
      }
    }
  }
}
