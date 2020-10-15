// Angular
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';

//
import {Event} from "@blockframes/event/+state";
import {Observable} from "rxjs";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AuthQuery, User} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: '[event] event-meeting-container-video',
  templateUrl: './container-video.component.html',
  styleUrls: ['./container-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerVideoComponent implements OnInit, OnDestroy {

  //Input event meeting
  @Input() event: Event;

  //All Remote Participants in the room Twilio (all participant connected without local)
  arrayOfRemoteParticipantConnected$: Observable<IParticipantMeeting[]>;

  user: User;

  isSeller: boolean;

  constructor(private meetingService: MeetingService,
              private query: AuthQuery) {
  }

  async ngOnInit() {

    this.arrayOfRemoteParticipantConnected$ = this.meetingService.getConnectedRemoteParticipants();

    this.user = this.query.user;

    this.isSeller = this.query.userId === this.event.organizedBy.uid;

    await this.meetingService.doCreateLocalPreview();

    await this.meetingService.doConnectToMeetingService(this.event);
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
