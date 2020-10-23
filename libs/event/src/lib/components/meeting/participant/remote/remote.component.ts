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
   * Set up all event we need for meeting
   * @param participant
   */
  setupParticipantEvent(participant: Participant): void {

    participant.on(meetingEventEnum.TrackSubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.attachTracks([track]);
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.detachTracks([track]);
    })

    participant.on(meetingEventEnum.Disconnected, () => {
      this.detachTracks(this.meetingService.getParticipantTracks(this.twilioData) as RemoteTrack[]);
    })

    participant.on(meetingEventEnum.TrackDisabled, (remoteTrackPublication: (RemoteAudioTrackPublication | RemoteVideoTrackPublication)) => {
      this.detachTracks([remoteTrackPublication.track]);
      this.setupVideoAudio(remoteTrackPublication.kind, false);
    })

    participant.on(meetingEventEnum.TrackEnabled, (remoteTrackPublication: (RemoteAudioTrackPublication | RemoteVideoTrackPublication)) => {
      this.attachTracks([remoteTrackPublication.track]);
      this.setupVideoAudio(remoteTrackPublication.kind, true);
    })

    participant.on(meetingEventEnum.TrackStarted, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.setupVideoAudio(track.kind, true);
    })
  }

  videoMock(participant: Participant): void {
    const tracks: (RemoteAudioTrack | RemoteVideoTrack)[] = this.meetingService.getParticipantTracks(participant) as (RemoteAudioTrack | RemoteVideoTrack)[];
    this.attachTracks(tracks);
  }

  setupVideoAudio(kind: keyof IStatusVideoAudio, boolToChange: boolean): void {
    this.meetingService.setupVideoAudio(this.participant.identity, kind, boolToChange);
  }

  /**
   * Attach the Tracks to the DOM.
   * @param tracks - track to attach in the container
   */
  attachTracks(tracks: RemoteTrack[]): void {
    tracks.forEach((track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      if (track) {
        track.attach((track.kind === 'video') ? this.video.nativeElement : this.audio.nativeElement);
      }
    });
  }

  /**
   *  Detach the Tracks from the DOM.
   * @param tracks - track to detach of the DOM
   */
  detachTracks(tracks: RemoteTrack[]): void {
    tracks.forEach((track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      if (track) {
        track.detach((track.kind === 'video') ? this.video.nativeElement : this.audio.nativeElement);
      }
    });
  }

  ngOnDestroy() {
    this.detachTracks(this.meetingService.getParticipantTracks(this.twilioData) as RemoteTrack[]);
    this.twilioData.removeAllListeners();
  }
}
