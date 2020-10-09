import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MeetingService, IStatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";
import {Observable} from "rxjs";

@Component({
  selector: 'event-meeting-control-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class ControlVideoComponent implements OnInit {

  localVideoMicStatus$: Observable<IStatusVideoMic>;

  constructor(private meetingService: MeetingService) {
    this.localVideoMicStatus$ = this.meetingService.getLocalVideoMicStatus()
  }

  ngOnInit(): void {
  }

  muteVideo(localVideoMicStatus: IStatusVideoMic){
    this.meetingService.muteOrUnmuteYourLocalMediaPreview('video', localVideoMicStatus.video)
  }

  getControlVideo(localVideoMicStatus: IStatusVideoMic){
  }
}
