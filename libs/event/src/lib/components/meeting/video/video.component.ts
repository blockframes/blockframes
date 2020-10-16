// Angular
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

// Blockframes
import {Event} from "@blockframes/event/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// RxJs
import {Observable} from "rxjs";

// Twilio
import {Participant} from "twilio-video";

@Component({
  selector: '[remoteParticipants] [event] [getTwilioParticipant] [isSeller] event-meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoComponent {

  @Input() remoteParticipants: IParticipantMeeting[];
  @Input() event: Event;
  @Input() getTwilioParticipant: (uid: string) => Participant;
  @Input() isSeller: boolean;

  @Output() eventSetupVideoAudio = new EventEmitter;

  /**
   * To know if local is alone in Connected participants
   */
  isRoomEmpty(remoteParticipants) {
    return remoteParticipants.length === 0;
  }

  /**
   * Function to know how many column we need for mat-grid-list
   * @param remoteParticipants
   */
  getColumns(remoteParticipants) {
    if (!!remoteParticipants) {
      if (remoteParticipants.length < 1) {
        return 0;
      }
      const remoteParticipantsLength = remoteParticipants.length;
      return (remoteParticipantsLength === 1) ? 1 : (remoteParticipantsLength > 1 && remoteParticipantsLength < 5) ? 2 : 3;
    }
    return 0;
  }

  /**
   * For the remote video/audio we need that to know when the track is reel attach
   * @param identity
   * @param kind
   * @param boolToChange
   */
  setupVideoAudio({identity, kind, boolToChange}) {
    this.eventSetupVideoAudio.emit({identity, kind, boolToChange})
  }

  /**
   * To identify all video with participant's identity (uid of User)
   * @param index
   * @param item
   */
  identify(index, item) {
    return item.identity;
  }

  /**
   * Get Twilio Participant data by Uid
   * @param participant
   */
  doGetTwilioParticipant(participant): Participant {
    return this.getTwilioParticipant(participant.identity);
  }
}
