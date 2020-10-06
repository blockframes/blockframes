import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Event } from '@blockframes/event/+state';
import { Meeting } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: '[event] media-control',
  templateUrl: './media-control.component.html',
  styleUrls: ['./media-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaControlComponent {

  @Input() event: Event<Meeting>;

}
