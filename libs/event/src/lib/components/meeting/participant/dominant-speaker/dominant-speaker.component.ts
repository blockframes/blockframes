// Angular
import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

//Blockframes
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {IParticipantMeeting, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Twilio
import {Participant, RemoteAudioTrack, RemoteDataTrack, RemoteTrackPublication, RemoteVideoTrack} from 'twilio-video';

@Component({
  selector: '[participant] [twilioData] event-meeting-dominant-speaker',
  templateUrl: './dominant-speaker.component.html',
  styleUrls: ['./dominant-speaker.component.scss']
})
export class DominantSpeakerComponent extends AbstractParticipant implements AfterViewInit {

  @Input() participant: IParticipantMeeting
  @Input() twilioData: Participant

  @Output() eventSetupVideoAudio = new EventEmitter();

  @ViewChild('dominantSpeakerVideo') containerDominantSpeakerVideo;

  constructor(private elm: ElementRef) {
    super();
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
    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#dominantSpeakerVideo`);

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
      this.setupVideoAudio(track.kind, false)
    })

    participant.on(meetingEventEnum.TrackEnabled, (track: RemoteTrackPublication) => {
      this.attachTracks([this.getTrackFromRemoteTrackPublication(track)], containerRemotParticipant)
      this.setupVideoAudio(track.kind, true)
    })

    participant.on(meetingEventEnum.TrackStarted, (track: RemoteTrackPublication) => {
      this.setupVideoAudio(track.kind, true)
    })
  }

  /**
   *
   * @param trackPublication:RemoteTrackPublication
   */
  getTrackFromRemoteTrackPublication(trackPublication: RemoteTrackPublication): RemoteVideoTrack | RemoteAudioTrack | RemoteDataTrack {
    return trackPublication.track;
  }

  /**
   * Attach track off participant dominant speaker
   * @param participants: Participant
   */
  makeDominantSpeakerTrack(participants: Participant) {
    this.attachParticipantTracks(participants, this.containerDominantSpeakerVideo.nativeElement)
  }


  setupVideoAudio(kind: string, boolToChange: boolean) {
    this.eventSetupVideoAudio.emit({identity: this.participant.identity, kind, boolToChange})
  }
}
