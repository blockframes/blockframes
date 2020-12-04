import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Event, EventService } from '@blockframes/event/+state';
import { Meeting } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: '[event] media-viewer',
  templateUrl: './media-viewer.component.html',
  styleUrls: ['./media-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaViewerComponent {

  constructor(private eventService: EventService) {}

  @Input() event: Event<Meeting>;

  stop() {
    if (!this.event.isOwner) return;
    const meta = { ...this.event.meta };
    meta.selectedFile = '';
    this.eventService.update(this.event.id, { meta });
  }

}
