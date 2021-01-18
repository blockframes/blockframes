import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Event, EventService } from '@blockframes/event/+state';
import { Meeting } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: '[event] file-puppets',
  templateUrl: './puppets.component.html',
  styleUrls: ['./puppets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePuppetsComponent {

  constructor(private eventService: EventService) {}

  private _event: Event<Meeting>;
  get event() { return this._event; }
  @Input() set event(value: Event<Meeting>) {
    this._event = value;
  }

  stop() {
    if (!this.event.isOwner) return;
    const meta = { ...this.event.meta };
    meta.selectedFile = '';
    this.eventService.update(this.event.id, { meta });
  }

}
