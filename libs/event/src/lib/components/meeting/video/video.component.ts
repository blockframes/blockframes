//Angular
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

//Blockframes
import {Event} from "@blockframes/event/+state";
import {Participant as IParticipantMeeting} from 'twilio-video';

@Component({
  selector: 'event-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoComponent implements OnInit {

  //Input event meeting
  @Input() arrayOfParticipantConnected: IParticipantMeeting[];
  @Input() localParticipantConnected: IParticipantMeeting;
  @Input() dominantParticipantForBuyer: IParticipantMeeting;
  @Input() localPreviewTracks: any;
  @Input() event: Event;

  constructor() {
  }

  ngOnInit() {
  }


  getIfLocalIsAlone(){
    return this.arrayOfParticipantConnected.length < 1;
  }

  /**
   *
   * @param index
   * @param item
   */
  identify(index, item) {
    return item.identity;
  }
}
