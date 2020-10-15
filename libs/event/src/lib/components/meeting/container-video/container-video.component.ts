// Angular
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';

// Blockframes
import {Event} from "@blockframes/event/+state";
import {IStatusVideoMic, MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AuthQuery, User} from "@blockframes/auth/+state";
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

  user: User;

  isSeller: boolean;

  constructor(private meetingService: MeetingService,
              private query: AuthQuery) {
  }

  async ngOnInit() {

    console.log('1 ngOnInit')

    this.arrayOfParticipantConnected$ = this.meetingService.getConnectedAllParticipants();
    console.log('2 ngOnInit')
    this.arrayOfRemoteParticipantConnected$ = this.meetingService.getConnectedRemoteParticipants();
    console.log('3 ngOnInit')
    this.user = this.query.user;
    console.log('4 ngOnInit')
    this.isSeller = this.event.isOwner;
    console.log('5 ngOnInit')

    await this.meetingService.doCreateLocalPreview();
    console.log('6 ngOnInit')
    await this.meetingService.doConnectToMeetingService(this.event);
    console.log('7 ngOnInit')
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
    this.meetingService.doDisconnected()
  }
}
