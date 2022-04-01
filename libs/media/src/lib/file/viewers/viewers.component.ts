import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StorageFile, MeetingMediaControl } from '@blockframes/shared/model';

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
