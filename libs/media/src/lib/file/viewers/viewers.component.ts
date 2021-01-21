import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MeetingMediaControl } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: '[ref] file-viewers',
  templateUrl: './viewers.component.html',
  styleUrls: ['./viewers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewersComponent {
  @Input() eventId: string;
  @Input() ref: string;
  @Input() control: MeetingMediaControl;
}
