// Angular
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

// Blockframes
import {Event} from "@blockframes/event/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// RxJs
import {Observable} from "rxjs";

// Twilio
import {Participant} from "twilio-video";

@Component({
  selector: '[localParticipant] [remoteParticipants] [event] [getTwilioParticipant] event-meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoComponent {

  @Input() remoteParticipants: IParticipantMeeting[];
  @Input() localParticipant: IParticipantMeeting;
  @Input() event: Event;
  @Input() getTwilioParticipant: (uid: string) => Participant;

  /**
   * To know if local is alone in Connected participants
   */
  isRoomEmpty(remoteParticipants: IParticipantMeeting[]): boolean {
    return remoteParticipants.length === 0;
  }

  /**
   * To know if the room as Dominant in Connected participants
   */
  isRoomAsDominant(remoteParticipants: IParticipantMeeting[]) {
    return !!remoteParticipants.find(participant => !!participant.isDominantSpeaker);
  }

  /**
   * Function to know how many column we need for mat-grid-list
   * @param remoteParticipants
   */
  getColumns(remoteParticipants: IParticipantMeeting[]): number {
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
   * To identify all video with participant's identity (uid of User)
   * @param index
   * @param item
   */
  identify(index: number, item: IParticipantMeeting): string {
    return item.identity;
  }

  /**
   * Get Twilio Participant data by Uid
   * @param participant
   */
  doGetTwilioParticipant(participant: IParticipantMeeting): Participant {
    return this.getTwilioParticipant(participant.identity);
  }
}
