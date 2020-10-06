//Angular
import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

//Blockframes
import {Event} from "@blockframes/event/+state";
import {BehaviorSubject, Observable} from "rxjs";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: 'event-meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoComponent implements OnInit {

  //Input event meeting
  @Input() $participantConnectedDataSource: BehaviorSubject<IParticipantMeeting[]>;
  @Input() arrayOfParticipantConnected$: Observable<IParticipantMeeting[]>;
  @Input() localParticipantConnected$: Observable<IParticipantMeeting>;
  @Input() dominantParticipantForBuyer$: Observable<IParticipantMeeting>;
  @Input() localPreviewTracks$: Observable<any>;
  @Input() event: Event;
  @Input() isOwner: boolean;

  @Output() eventSetUpLocalVideoAndAudio = new EventEmitter;

  constructor() {
  }

  ngOnInit() {
  }


  getIfLocalIsAlone() {
    return this.$participantConnectedDataSource.getValue().length < 1;
  }

  setUpLocalVideoAndAudio({kind, boolToChange}) {
    this.eventSetUpLocalVideoAndAudio.emit({kind, boolToChange})
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
