import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { EventService } from '@blockframes/event/+state';
import { Event, Meeting, MeetingMediaControl } from '@blockframes/model';
import { debounceFactory } from '@blockframes/utils/helpers';

@Component({
  selector: '[event] file-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileControlsComponent {

  @Input() event: Event<Meeting>;

  /** A debounced version of `updateRemoteControl` to avoid writing on the db more than every 1s */
  private debouncedUpdateRemoteControl = debounceFactory((newControl: MeetingMediaControl) => this.updateRemoteControl(newControl), 1000);

  constructor(
    private eventService: EventService,
  ) { }

  updateRemoteControl(control: MeetingMediaControl) {
    const controls = { ...this.event.meta.controls, [this.event.meta.selectedFile]: control };
    const meta = { ...this.event.meta, controls };
    this.eventService.update({ ...this.event, meta });
  }

  controlChange(control: MeetingMediaControl) {
    this.debouncedUpdateRemoteControl(control);
  }
}
