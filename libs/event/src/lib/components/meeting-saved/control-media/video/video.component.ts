import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MeetingService, StatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";
import {Observable} from "rxjs";

@Component({
  selector: 'event-control-video-saved',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class ControlVideoComponentSaved implements OnInit {

  localVideoMicStatus$: Observable<StatusVideoMic>;

  constructor(private meetingService: MeetingService) {
    this.localVideoMicStatus$ = this.meetingService.getLocalVideoMicStatus()
  }

  ngOnInit(): void {
  }

  muteVideo(localVideoMicStatus: StatusVideoMic){
    console.log('muteVideo :', {localVideoMicStatus})
    this.meetingService.muteOrUnmuteYourLocalMediaPreview('video', localVideoMicStatus.video)
  }

  getControlVideo(localVideoMicStatus: StatusVideoMic){
  }
}
