import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {Observable} from "rxjs";


@Component({
  selector: 'event-meeting-participants-nav',
  templateUrl: './participants-nav.component.html',
  styleUrls: ['./participants-nav.component.scss']
})
export class ParticipantsNavComponent {

  @Input() participants: IParticipantMeeting[];
}
