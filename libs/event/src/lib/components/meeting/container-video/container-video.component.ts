// Angular
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';

// Blockframes
import {Event} from "@blockframes/event/+state";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AuthQuery, User} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Rxjs
import {Observable} from "rxjs";

@Component({
  selector: '[event] event-meeting-container-video',
  templateUrl: './container-video.component.html',
  styleUrls: ['./container-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerVideoComponent implements OnInit, OnDestroy {

  @Input() event: Event;

  /**
   * All Remote Participants in the room Twilio (all participant connected without local)
   */
  remoteParticipants$: Observable<IParticipantMeeting[]>;

  /**
   * All Remote Participants in the room Twilio (all participant connected)
   */
  participants$: Observable<IParticipantMeeting[]>;

  user: User;

  constructor(private meetingService: MeetingService, private query: AuthQuery) {

  }

  async ngOnInit() {

    this.participants$ = this.meetingService.getAllParticipants();
    this.remoteParticipants$ = this.meetingService.getParticipants();
    this.user = this.query.user;

    const isAudio: boolean = await this.meetingService.isAudioAvailable();
    const isVideo: boolean = await this.meetingService.isVideoAvailable();

    await this.meetingService.createPreview(isAudio, isVideo);
    await this.meetingService.connectToMeeting(this.event, this.user.uid, isAudio, isVideo);
  }

  /**
   * when ngDestroy we disconnect the local participant;
   */
  ngOnDestroy(): void {
    this.meetingService.disconnect()
  }
}
