import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {IParticipantMeeting, IStatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

@Component({
  selector: 'event-meeting-control-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class ControlAudioComponent {

  participant$: Observable<IParticipantMeeting>;

  constructor(private meetingService: MeetingService) {
    this.participant$ = this.meetingService.getLocalParticipants()
  }

  muteAudio(participant: IParticipantMeeting){
    this.meetingService.setupVideoAudio(participant.identity, 'audio', !participant.statusMedia.audio);
  }
}
