import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Event, EventService} from "@blockframes/event/+state";
import {Observable} from "rxjs";
import {IStatusVideoMic, MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";
import {ErrorResultResponse} from "@blockframes/utils/utils";
import {LocalAudioTrack, LocalVideoTrack} from 'twilio-video';
import {User} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: 'event-meeting-container-video',
  templateUrl: './container-video.component.html',
  styleUrls: ['./container-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerVideoComponent implements OnInit, OnDestroy {

  //Input event meeting
  @Input() event: Event;

  //All Participants in the room Twilio
  arrayOfParticipantConnected$: Observable<IParticipantMeeting[]>;

  //Participant local in the room
  localParticipantConnected$: Observable<IParticipantMeeting>;

  //Dominant Participant for Buyer
  dominantParticipantForBuyer$: Observable<IParticipantMeeting>;

  localPreviewTracks$: Observable<Array<LocalAudioTrack | LocalVideoTrack>>;

  localVideoAudioIsOn$: Observable<IStatusVideoMic>

  user: User;

  isSeller: boolean;

  constructor(private meetingService: MeetingService) {

    this.localPreviewTracks$ = this.meetingService.getLocalPreviewTracks();
    this.arrayOfParticipantConnected$ = this.meetingService.getConnectedAllParticipants();
    this.localParticipantConnected$ = this.meetingService.getConnectedLocalParticipant();
    this.dominantParticipantForBuyer$ = this.meetingService.getConnectedDominantParticipant();
    this.localVideoAudioIsOn$ = this.meetingService.getLocalVideoMicStatus();
  }

  async ngOnInit() {


    this.user = this.meetingService.getActiveUser();

    this.isSeller = this.meetingService.getIfIsReelOwner(this.event);

    await this.meetingService.doCreateLocalPreview();

    this.meetingService.doConnectToMeetingService(this.event);
  }

  /**
   * Event come from child when audio or video is deactivated or activated
   *
   * @param kind
   * @param boolToChange
   */
  doSetupLocalVideoAndAudio({kind, boolToChange}) {
    this.meetingService.doSetupLocalVideoAndAudio(kind, boolToChange)
  }

  /**
   * when ngDestroy we disconnect the local participant;
   */
  ngOnDestroy() {
    console.log('ngOnDestroy')
    this.meetingService.doDisconnected()
  }
}
