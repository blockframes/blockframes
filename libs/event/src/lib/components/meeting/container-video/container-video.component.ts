// Angular
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';

// Blockframes
import {Event} from "@blockframes/event/+state";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AuthQuery, User} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Rxjs
import {Observable} from "rxjs";
import {Participant} from "twilio-video";

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

  user: User;

  constructor(private meetingService: MeetingService, private query: AuthQuery) {

  }

  async ngOnInit() {

    this.remoteParticipants$ = this.meetingService.getParticipants();
    this.user = this.query.user;

    const isAudio: boolean = await this.meetingService.isAudioAvailable();
    const isVideo: boolean = await this.meetingService.isVideoAvailable();

    await this.meetingService.createPreview(isAudio, isVideo);
    await this.meetingService.connectToMeeting(this.event, this.user.uid, isAudio, isVideo);
  }

  getTwilioParticipant = (uid: string): Participant => {
    return this.meetingService.getTwilioParticipant(uid);
  }

  /**
   * Event come from child when audio or video is deactivated or activated
   *
   * @param identity: string
   * @param kind: string
   * @param boolToChange: boolean
   */
  setupVideoAudio({identity, kind, boolToChange}): void {
    this.meetingService.setupVideoAudio(identity, kind, boolToChange)
  }

  /**
   * when ngDestroy we disconnect the local participant;
   */
  ngOnDestroy(): void {
    this.meetingService.disconnect()
  }
}
