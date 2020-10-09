// Angular
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

// Blockframes
import {Event} from "@blockframes/event/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService, IStatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";

// RxJs
import {Observable} from "rxjs";

@Component({
  selector: '[arrayOfParticipantConnected$] [localParticipantConnected$] [dominantParticipantForBuyer$] [localPreviewTracks$] [event] event-meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  // Input
  @Input() arrayOfParticipantConnected$: Observable<IParticipantMeeting[]>;
  @Input() localParticipantConnected$: Observable<IParticipantMeeting>;
  @Input() dominantParticipantForBuyer$: Observable<IParticipantMeeting>;
  @Input() localPreviewTracks$: Observable<any>;
  @Input() event: Event;

  // Outup
  @Output() eventSetUpLocalVideoAndAudio = new EventEmitter;

  isBuyer: boolean;

  localVideoAudioIsOn$: Observable<IStatusVideoMic>

  constructor(private meetingService: MeetingService) {
  }

  ngOnInit() {
    this.localVideoAudioIsOn$ = this.meetingService.getLocalVideoMicStatus();
    this.isBuyer = this.meetingService.getIfIsReelOwner(this.event)
  }

  /**
   * To know if local is alone in Connected participants
   */
  getIfLocalIsAlone() {
    return this.meetingService.getAllConnectedParticipantsWithoutLocal() < 1;
  }

  /**
   * Function to know how many column we need for mat-grid-list
   * @param arrayOfParticipantConnected
   */
  numOfCols(arrayOfParticipantConnected) {
    if(!!arrayOfParticipantConnected){
      if(arrayOfParticipantConnected.length < 1){
        return 0;
      }
      // need - 1 to remove the local User
      const allConnectedParticipants = arrayOfParticipantConnected.length - 1;
      return (allConnectedParticipants < 2) ? 1 : (allConnectedParticipants > 1 && allConnectedParticipants < 5) ? 2 : 3;
    }
    return 0;
  }

  /**
   * For the local video/audio we need that to know when the track is reel attach
   * @param kind
   * @param boolToChange
   */
  setUpLocalVideoAndAudio({kind, boolToChange}) {
    this.eventSetUpLocalVideoAndAudio.emit({kind, boolToChange})
  }

  /**
   * To identify all video with participant's identity (uid of User)
   * @param index
   * @param item
   */
  identify(index, item) {
    return item.identity;
  }
}
