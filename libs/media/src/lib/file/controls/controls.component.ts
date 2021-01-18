import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Event, EventService } from '@blockframes/event/+state';
import { Meeting, MeetingPdfControl } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: '[event] file-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileControlsComponent {

  @Input() event: Event<Meeting>;

  constructor(
    private eventService: EventService,
  ) { }

  controlChange(control: MeetingPdfControl) {
    this.eventService.update({
      ...this.event,
      meta: {
        ...this.event.meta,
        controls: {
          ...this.event.meta.controls,
          [this.event.meta.selectedFile]: control,
        },
      }
    });
  }
}
