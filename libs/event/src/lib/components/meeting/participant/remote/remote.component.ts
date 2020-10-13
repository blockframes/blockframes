// Angular
import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, Renderer2} from '@angular/core';

// Blockframes
import {IStatusVideoMic, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Rxjs
import {BehaviorSubject, Observable} from "rxjs";

// Twilio Video SDK
import {Participant, RemoteTrackPublication} from 'twilio-video';

@Component({
  selector: '[participant] event-meeting-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteComponent extends AbstractParticipant implements AfterViewInit {

  // Observable to now when video/audio is disabled/enable
  protected $camMicIsOnRemoteDataSource: BehaviorSubject<IStatusVideoMic> = new BehaviorSubject({
    video: false,
    audio: false
  });
  public camMicIsOnRemote$: Observable<IStatusVideoMic> = this.$camMicIsOnRemoteDataSource.asObservable();

  @Input() participant: IParticipantMeeting
  @Input() twilioData: Participant

  constructor(private renderer: Renderer2, private elm: ElementRef) {
    super();
  }

  ngAfterViewInit() {
    this.setUpRemoteParticipantEvent(this.twilioData);
    this.mocDivVideo(this.twilioData);
  }

  /**
   * Set up all event we need for meeting
   * @param participant
   */
  setUpRemoteParticipantEvent(participant: Participant) {
    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);

    participant.on(meetingEventEnum.TrackSubscribed, (track) => {
      this.attachTracks([track], containerRemotParticipant)
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      this.detachTracks([track])
    })

    participant.on(meetingEventEnum.Disconnected, () => {
      this.detachParticipantTracks(this.twilioData);
    })

    participant.on(meetingEventEnum.TrackDisabled, (track: RemoteTrackPublication) => {
      this.detachTracks([this.getTrackFromRemoteTrackPublication(track)])
      this.setUpVideoAndAudio(track.kind, false)
    })

    participant.on(meetingEventEnum.TrackEnabled, (track: RemoteTrackPublication) => {
      this.attachTracks([this.getTrackFromRemoteTrackPublication(track)], containerRemotParticipant)
      this.setUpVideoAndAudio(track.kind, true)
    })


    participant.on(meetingEventEnum.TrackStarted, (track) => {
      this.setUpVideoAndAudio(track.kind, true)
    })
  }

  /**
   *
   * @param participant
   */
  mocDivVideo(participant: Participant) {
    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);
    this.attachParticipantTracks(participant, containerRemotParticipant);

  }

  setUpVideoAndAudio(kind, boolToChange) {
    if (kind === 'video') {
      this.$camMicIsOnRemoteDataSource.next({...this.$camMicIsOnRemoteDataSource.getValue(), video: boolToChange});
    } else {
      this.$camMicIsOnRemoteDataSource.next({...this.$camMicIsOnRemoteDataSource.getValue(), audio: boolToChange});
    }
  }
}
