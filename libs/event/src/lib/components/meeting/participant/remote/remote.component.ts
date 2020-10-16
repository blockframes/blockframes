// Angular
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2
} from '@angular/core';

// Blockframes
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {IParticipantMeeting, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Twilio
import {Participant, RemoteTrackPublication} from 'twilio-video';

@Component({
  selector: '[participant] [twilioData] event-meeting-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteComponent extends AbstractParticipant implements AfterViewInit {

  @Input() participant: IParticipantMeeting
  @Input() twilioData: Participant

  @Output() eventSetupVideoAudio = new EventEmitter();

  constructor(private renderer: Renderer2, private elm: ElementRef) {
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
  setupParticipantEvent(participant: Participant) {
    const participantContainer = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);

    participant.on(meetingEventEnum.TrackSubscribed, (track) => {
      this.attachTracks([track], participantContainer)
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      this.detachTracks([track])
    })

    participant.on(meetingEventEnum.Disconnected, () => {
      this.detachParticipantTracks(this.twilioData);
    })

    participant.on(meetingEventEnum.TrackDisabled, (remoteTrack: RemoteTrackPublication) => {
      this.detachTracks([remoteTrack.track])
      this.setupVideoAudio(remoteTrack.kind, false)
    })

    participant.on(meetingEventEnum.TrackEnabled, (remoteTrack: RemoteTrackPublication) => {
      this.attachTracks([remoteTrack.track], participantContainer)
      this.setupVideoAudio(remoteTrack.kind, true)
    })

    participant.on(meetingEventEnum.TrackStarted, (track) => {
      this.setupVideoAudio(track.kind, true)
    })
  }

  videoMock(participant: Participant) {
    const participantContainer = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);
    this.attachParticipantTracks(participant, participantContainer);

  }

  setupVideoAudio(kind: string, boolToChange: boolean) {
    this.eventSetupVideoAudio.emit({identity: this.participant.identity, kind, boolToChange})
  }
}
