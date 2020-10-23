// Angular
import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';

//Blockframes
import {IParticipantMeeting, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.interface";
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
  selector: '[participant] [twilioData] event-meeting-dominant-speaker',
  templateUrl: './dominant-speaker.component.html',
  styleUrls: ['./dominant-speaker.component.scss']
})
export class DominantSpeakerComponent implements AfterViewInit, OnDestroy {

  @Input() participant: IParticipantMeeting
  @Input() twilioData: Participant

  @Output() eventSetupVideoAudio = new EventEmitter();

  @ViewChild('video') video: ElementRef;
  @ViewChild('audio') audio: ElementRef;

  constructor(private meetingService: MeetingService) {
  }

  ngAfterViewInit() {
    this.setUpRemoteParticipantEvent(this.twilioData);
    this.videoMock(this.twilioData);
  }

  /**
   *
   * @param participant
   */
  setUpRemoteParticipantEvent(participant: Participant) {

    participant.on(meetingEventEnum.TrackSubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.attachTracks([track]);
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.detachTracks([track]);
    })

    participant.on(meetingEventEnum.Disconnected, () => {
      this.detachTracks(this.meetingService.getParticipantTracks(this.twilioData) as RemoteTrack[]);
    })

    participant.on(meetingEventEnum.TrackDisabled, (remoteTrack: (RemoteAudioTrackPublication | RemoteVideoTrackPublication)) => {
      this.detachTracks([remoteTrack.track])
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
    const tracks: (RemoteAudioTrack | RemoteVideoTrack)[] = this.meetingService.getParticipantTracks(participant) as (RemoteAudioTrack | RemoteVideoTrack)[];
    this.attachTracks(tracks);
  }

  setupVideoAudio(kind, boolToChange) {
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
