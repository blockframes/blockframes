// Angular
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input, OnDestroy,
  Output,
  Renderer2, ViewChild
} from '@angular/core';

// Blockframes
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {IParticipantMeeting, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Twilio
import {
  Participant,
  RemoteAudioTrack, RemoteAudioTrackPublication,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteVideoTrack, RemoteVideoTrackPublication,
  TrackPublication
} from 'twilio-video';

@Component({
  selector: '[participant] [twilioData] event-meeting-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteComponent extends AbstractParticipant implements AfterViewInit, OnDestroy {

  @Input() participant: IParticipantMeeting;
  @Input() twilioData: Participant;

  @Output() eventSetupVideoAudio = new EventEmitter();

  @ViewChild('remoteVideo') containerRemoteVideo: ElementRef;

  constructor() {
    super();
  }

  ngAfterViewInit() {
    this.setupParticipantEvent(this.twilioData);
    this.videoMock(this.twilioData);
  }

  /**
   * Set up all event we need for meeting
   * @param participant
   */
  setupParticipantEvent(participant: Participant): void {
    const participantContainer = this.containerRemoteVideo.nativeElement;

    participant.on(meetingEventEnum.TrackSubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.attachTracks([track], participantContainer)
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.detachTracks([track])
    })

    participant.on(meetingEventEnum.Disconnected, () => {
      this.detachParticipantTracks(this.twilioData);
    })

    participant.on(meetingEventEnum.TrackDisabled, (remoteTrack: (RemoteAudioTrackPublication | RemoteVideoTrackPublication)) => {
      this.detachTracks([remoteTrack.track])
      this.setupVideoAudio(remoteTrack.kind, false)
    })

    participant.on(meetingEventEnum.TrackEnabled, (remoteTrack: (RemoteAudioTrackPublication | RemoteVideoTrackPublication)) => {
      this.attachTracks([remoteTrack.track], participantContainer)
      this.setupVideoAudio(remoteTrack.kind, true)
    })

    participant.on(meetingEventEnum.TrackStarted, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.setupVideoAudio(track.kind, true)
    })
  }

  videoMock(participant: Participant): void {
    const participantContainer = this.containerRemoteVideo.nativeElement;
    this.attachParticipantTracks(participant, participantContainer);

  }

  setupVideoAudio(kind: string, boolToChange: boolean): void {
    this.eventSetupVideoAudio.emit({identity: this.participant.identity, kind, boolToChange})
  }

  ngOnDestroy() {
    this.twilioData.removeAllListeners();
  }
}
