import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MeetingMediaControl } from '@blockframes/model';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: '[ref] file-viewers',
  templateUrl: './viewers.component.html',
  styleUrls: ['./viewers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewersComponent {
  @Input() eventId: string;
  @Input() ref: StorageFile;
  @Input() control: MeetingMediaControl;
}
