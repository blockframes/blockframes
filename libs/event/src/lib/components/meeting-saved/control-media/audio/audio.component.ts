import { Component, OnInit } from '@angular/core';
import {MeetingService, StatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";
import {Observable} from "rxjs";

@Component({
  selector: 'event-control-audio-saved',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class ControlAudioComponentSaved implements OnInit {

  localVideoMicStatus$: Observable<StatusVideoMic>;

  constructor(private meetingService: MeetingService) {
    this.localVideoMicStatus$ = this.meetingService.getLocalVideoMicStatus()
  }

  ngOnInit(): void {
  }

  muteAudio(localVideoMicStatus: StatusVideoMic){
    console.log('muteAudio :', {localVideoMicStatus})
    this.meetingService.muteOrUnmuteYourLocalMediaPreview('audio', localVideoMicStatus.audio);
  }
}
