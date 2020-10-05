import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

import {Participant} from 'twilio-video';


@Component({
  selector: 'event-meeting-participants-nav',
  templateUrl: './participants-nav.component.html',
  styleUrls: ['./participants-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantsNavComponent {

  @Input() participants: Participant[];

  constructor(
  ) { }
}
