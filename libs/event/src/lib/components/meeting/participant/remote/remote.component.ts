// Angular
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';

// Blockframes
import {
  IParticipantMeeting,
  IStatusVideoAudio,
  meetingEventEnum
} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

// Twilio
import {
  Participant,
  RemoteAudioTrack,
  RemoteAudioTrackPublication,
  RemoteVideoTrack,
  RemoteVideoTrackPublication
} from 'twilio-video';

@Component({
  selector: '[participant] [twilioData] event-meeting-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss']
})
export class RemoteComponent implements AfterViewInit, OnDestroy {

  @Input() participant: IParticipantMeeting;
  @Input() twilioData: Participant;

  @ViewChild('remoteVideo') containerRemoteVideo: ElementRef;

  constructor(private meetingService: MeetingService) {
  }

  ngAfterViewInit() {
    this.setupParticipantEvent(this.twilioData);
    this.meetingService.attachParticipantTracks(this.twilioData, this.containerRemoteVideo.nativeElement);
  }

  /**
   * Set up all event we need for meeting
   * @param participant
   */
  setupParticipantEvent(participant: Participant): void {
    const participantContainer = this.containerRemoteVideo.nativeElement;

    participant.on(meetingEventEnum.TrackSubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.meetingService.attachTracks([track], participantContainer);
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.meetingService.detachTracks([track]);
    })

    participant.on(meetingEventEnum.Disconnected, () => {
      this.meetingService.detachParticipantTracks(this.twilioData);
    })

    participant.on(meetingEventEnum.TrackDisabled, (remoteTrack: (RemoteAudioTrackPublication | RemoteVideoTrackPublication)) => {
      this.meetingService.detachTracks([remoteTrack.track])
      this.setupVideoAudio(remoteTrack.kind, false);
    })

    participant.on(meetingEventEnum.TrackEnabled, (remoteTrack: (RemoteAudioTrackPublication | RemoteVideoTrackPublication)) => {
      this.meetingService.attachTracks([remoteTrack.track], participantContainer)
      this.setupVideoAudio(remoteTrack.kind, true);
    })

    participant.on(meetingEventEnum.TrackStarted, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.setupVideoAudio(track.kind, true);
    })
  }

  setupVideoAudio(kind: keyof IStatusVideoAudio, boolToChange: boolean): void {
    this.meetingService.setupVideoAudio(this.participant.identity, kind, boolToChange);
  }

  ngOnDestroy() {
    this.meetingService.detachParticipantTracks(this.twilioData);
    this.twilioData.removeAllListeners();
  }
}
