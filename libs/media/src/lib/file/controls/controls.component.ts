import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Event } from '@blockframes/event/+state';
import { Meeting } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: '[event] file-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileControlsComponent {

  @Input() event: Event<Meeting>;

}
