import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

@Component({
  selector: 'event-meeting-control-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class ControlVideoComponent implements OnInit {

  participant$: Observable<IParticipantMeeting>;
  isVideoAvailable: boolean;

  constructor(private meetingService: MeetingService) {
    this.participant$ = this.meetingService.getLocalParticipants();
  }

  async ngOnInit() {
    this.isVideoAvailable = await this.meetingService.isVideoAvailable()
  }

  muteVideo(participant: IParticipantMeeting) {
    this.meetingService.muteUnmuteLocal(participant.identity, 'video', participant.statusMedia.video);
  }
}
