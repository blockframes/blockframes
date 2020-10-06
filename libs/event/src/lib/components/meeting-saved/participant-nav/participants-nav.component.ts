import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';

import { Participant as IParticipantMeeting } from 'twilio-video';


@Component({
  selector: 'event-participants-nav',
  templateUrl: './participants-nav.component.html',
  styleUrls: ['./participants-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantsNavComponentSaved implements OnInit {

  @Input() participants: IParticipantMeeting[];

  constructor(
  ) { }

  ngOnInit(): void {
  }

  /**
   *
   * @param participant
   */
  getInitialFromParticipant(participant){
    return `${participant.firstName.charAt(0).toUpperCase()}${participant.lastName.charAt(0).toUpperCase()}`
  }
}
