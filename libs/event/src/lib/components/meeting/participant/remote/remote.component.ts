// Angular
import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';

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
  RemoteTrack,
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

  @ViewChild('video') video: ElementRef;
  @ViewChild('audio') audio: ElementRef;

  constructor(private meetingService: MeetingService) {
  }

  ngAfterViewInit() {
    this.setupParticipantEvent(this.twilioData);
    this.videoMock(this.twilioData);
  }

  /**
   * Function to attach track video or audio to html element video or audio
   * @param tracks
   */
  attachTracks(tracks: RemoteTrack[]): void {
    if (tracks) {
      tracks.forEach((track: (RemoteAudioTrack | RemoteVideoTrack)) => {
        if (track) {
          track.attach((track.kind === 'video') ? this.video.nativeElement : this.audio.nativeElement);
        }
      });
    }
  }

  /**
   * Set up all event we need for meeting
   * @param participant
   */
  setupParticipantEvent(participant: Participant): void {
    // const participantContainer = this.containerRemoteVideo.nativeElement;

    participant.on(meetingEventEnum.TrackSubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.attachTracks([track]);
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
      this.attachTracks([remoteTrack.track])
      this.setupVideoAudio(remoteTrack.kind, true);
    })

    participant.on(meetingEventEnum.TrackStarted, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.setupVideoAudio(track.kind, true);
    })
  }

  videoMock(participant: Participant): void {
    const tracks: RemoteTrack[] = this.meetingService.attachParticipantTracks(participant);
    this.attachTracks(tracks)
  }

  setupVideoAudio(kind: keyof IStatusVideoAudio, boolToChange: boolean): void {
    this.meetingService.setupVideoAudio(this.participant.identity, kind, boolToChange);
  }

  ngOnDestroy() {
    this.meetingService.detachParticipantTracks(this.twilioData);
    this.twilioData.removeAllListeners();
  }
}
