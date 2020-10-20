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

  @ViewChild('dominantSpeakerVideo') containerDominantSpeakerVideo: ElementRef;

  constructor(private meetingService: MeetingService) {
  }

  ngAfterViewInit() {
    this.setUpRemoteParticipantEvent(this.twilioData);
    this.makeDominantSpeakerTrack(this.twilioData);
  }

  /**
   *
   * @param participant
   */
  setUpRemoteParticipantEvent(participant: Participant) {
    const containerDominantParticipant = this.containerDominantSpeakerVideo.nativeElement;

    participant.on(meetingEventEnum.TrackSubscribed, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.meetingService.attachTracks([track], containerDominantParticipant);
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
      this.meetingService.attachTracks([remoteTrack.track], containerDominantParticipant)
      this.setupVideoAudio(remoteTrack.kind, true);
    })

    participant.on(meetingEventEnum.TrackStarted, (track: (RemoteAudioTrack | RemoteVideoTrack)) => {
      this.setupVideoAudio(track.kind, true);
    })
  }

  /**
   * Attach track off participant dominant speaker
   * @param participants: Participant
   */
  makeDominantSpeakerTrack(participants: Participant) {
    this.meetingService.attachParticipantTracks(participants, this.containerDominantSpeakerVideo.nativeElement)
  }


  setupVideoAudio(kind: string, boolToChange: boolean) {
    this.eventSetupVideoAudio.emit({identity: this.participant.identity, kind, boolToChange})
  }

  ngOnDestroy() {
    this.meetingService.detachParticipantTracks(this.twilioData);
    this.twilioData.removeAllListeners();
  }
}
