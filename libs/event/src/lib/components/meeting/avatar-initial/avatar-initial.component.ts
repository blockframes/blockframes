// Angular
import {Component, Input} from '@angular/core';

// Blockframes
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: '[participant] event-meeting-avatar-initial',
  templateUrl: './avatar-initial.component.html',
  styleUrls: ['./avatar-initial.component.scss']
})
export class AvatarInitialComponent {

  @Input() participant: IParticipantMeeting;
  @Input() padding = 32;
}
