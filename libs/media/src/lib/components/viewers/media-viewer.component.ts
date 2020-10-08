import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Event } from '@blockframes/event/+state';
import { Meeting } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: '[event] media-viewer',
  templateUrl: './media-viewer.component.html',
  styleUrls: ['./media-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaViewerComponent {

  @Input() event: Event<Meeting>;

}
