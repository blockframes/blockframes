// Angular
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';

// Blockframes
import {Event} from "@blockframes/event/+state";
import {IStatusVideoMic, MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";
import {User} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Rxjs
import {Observable} from "rxjs";

// Twilio
import {LocalAudioTrack, LocalDataTrack, LocalVideoTrack} from "twilio-video";

@Component({
  selector: '[event] event-meeting-container-video',
  templateUrl: './container-video.component.html',
  styleUrls: ['./container-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerVideoComponent implements OnInit, OnDestroy {

  //Input event meeting
  @Input() event: Event;

  //All Participants in the room Twilio
  arrayOfParticipantConnected$: Observable<IParticipantMeeting[]>;

  //All Remote Participants in the room Twilio (all participant connected without local)
  arrayOfRemoteParticipantConnected$: Observable<IParticipantMeeting[]>;

  //Participant local in the room
  localParticipantConnected$: Observable<IParticipantMeeting>;

  //Dominant Participant for Buyer
  dominantParticipantForBuyer$: Observable<IParticipantMeeting>;


  localPreviewTracks$: Observable<Array<LocalAudioTrack | LocalVideoTrack | LocalDataTrack>>;

  localVideoAudioIsOn$: Observable<IStatusVideoMic>

  user: User;

  isSeller: boolean;

  constructor(private meetingService: MeetingService) {

    this.localPreviewTracks$ = this.meetingService.getLocalPreviewTracks();
    this.localVideoAudioIsOn$ = this.meetingService.getLocalVideoMicStatus();
    this.arrayOfParticipantConnected$ = this.meetingService.getConnectedAllParticipants();
    this.arrayOfParticipantConnected$ = this.meetingService.getConnectedAllParticipants();
    this.arrayOfRemoteParticipantConnected$ = this.meetingService.getConnectedRemoteParticipants();
    this.localParticipantConnected$ = this.meetingService.getConnectedLocalParticipant();
    this.dominantParticipantForBuyer$ = this.meetingService.getConnectedDominantParticipant();
  }

  async ngOnInit() {


    this.user = this.meetingService.getActiveUser();

    this.isSeller = this.meetingService.getIfIsReelOwner(this.event);

    await this.meetingService.doCreateLocalPreview();

    this.meetingService.doConnectToMeetingService(this.event);
  }

  getTwilioParticipantDataFromUid = (uid: string) => {
    return this.meetingService.getTwilioParticipantDataFromUid(uid);
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
