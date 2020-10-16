import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {IParticipantMeeting, IStatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

@Component({
  selector: 'event-meeting-control-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class ControlVideoComponent {

  participant$: Observable<IParticipantMeeting>;

  constructor(private meetingService: MeetingService) {
    this.participant$ = this.meetingService.getLocalParticipants();
  }

  muteVideo(participant: IParticipantMeeting){
    this.meetingService.setupVideoAudio(participant.identity, 'video', !participant.statusMedia.video);
  }
}
