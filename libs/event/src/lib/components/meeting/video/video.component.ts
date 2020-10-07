//Angular
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

//Blockframes
import {Event} from "@blockframes/event/+state";
import {Observable} from "rxjs";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

@Component({
  selector: 'event-meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  //Input event meeting
  @Input() arrayOfParticipantConnected$: Observable<IParticipantMeeting[]>;
  @Input() localParticipantConnected$: Observable<IParticipantMeeting>;
  @Input() dominantParticipantForBuyer$: Observable<IParticipantMeeting>;
  @Input() localPreviewTracks$: Observable<any>;
  @Input() event: Event;
  @Input() isOwner: boolean;

  @Output() eventSetUpLocalVideoAndAudio = new EventEmitter;

  constructor(private meetingService: MeetingService) {
  }

  ngOnInit() {
  }


  getIfLocalIsAlone() {
    return this.meetingService.numbConnectedParticipants() < 1;
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
