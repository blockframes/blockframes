import { Component, OnInit } from '@angular/core';
import {MeetingService, IStatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";
import {Observable} from "rxjs";

@Component({
  selector: 'event-meeting-control-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class ControlAudioComponent implements OnInit {

  localVideoMicStatus$: Observable<IStatusVideoMic>;

  constructor(private meetingService: MeetingService) {
    this.localVideoMicStatus$ = this.meetingService.getLocalVideoMicStatus()
  }

  ngOnInit(): void {
  }

  muteAudio(localVideoMicStatus: IStatusVideoMic){
    console.log('muteAudio :', {localVideoMicStatus})
    this.meetingService.muteOrUnmuteYourLocalMediaPreview('audio', localVideoMicStatus.audio);
  }
}
