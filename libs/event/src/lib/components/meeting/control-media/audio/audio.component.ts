import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

@Component({
  selector: 'event-meeting-control-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class ControlAudioComponent implements OnInit {

  participant$: Observable<IParticipantMeeting>;
  isAudioAvailable: boolean;


  constructor(private meetingService: MeetingService) {
    this.participant$ = this.meetingService.getLocalParticipants()
  }

  async ngOnInit() {
    this.isAudioAvailable = await this.meetingService.isAudioAvailable()
  }

  muteAudio(participant: IParticipantMeeting){
    this.meetingService.setupVideoAudio(participant.identity, 'audio', !participant.statusMedia.audio);
  }
}
