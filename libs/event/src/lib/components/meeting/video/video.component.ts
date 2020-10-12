// Angular
import {Component, EventEmitter, Input, Output} from '@angular/core';

// Blockframes
import {Event} from "@blockframes/event/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// RxJs
import {Observable} from "rxjs";

@Component({
  selector: '[arrayOfRemoteParticipantConnected$] [event] [isSeller] event-meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent  {

  // Input
  @Input() arrayOfRemoteParticipantConnected$: Observable<IParticipantMeeting[]>;
  @Input() event: Event;
  @Input() isSeller: boolean;

  // Outup
  @Output() eventSetUpLocalVideoAndAudio = new EventEmitter;

  /**
   * To know if local is alone in Connected participants
   */
  getIfLocalIsAlone(arrayOfRemoteParticipantConnected) {
    return arrayOfRemoteParticipantConnected.length === 0;
  }

  /**
   * Function to know how many column we need for mat-grid-list
   * @param arrayOfRemoteParticipantConnected
   */
  numOfCols(arrayOfRemoteParticipantConnected) {
    if(!!arrayOfRemoteParticipantConnected){
      if(arrayOfRemoteParticipantConnected.length < 1){
        return 0;
      }
      const allRemoteConnectedParticipants = arrayOfRemoteParticipantConnected.length;
      return (allRemoteConnectedParticipants === 1) ? 1 : (allRemoteConnectedParticipants > 1 && allRemoteConnectedParticipants < 5) ? 2 : 3;
    }
    return 0;
  }

  /**
   * For the local video/audio we need that to know when the track is reel attach
   * @param kind
   * @param boolToChange
   */
  doSetupLocalVideoAndAudio({kind, boolToChange}) {
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
