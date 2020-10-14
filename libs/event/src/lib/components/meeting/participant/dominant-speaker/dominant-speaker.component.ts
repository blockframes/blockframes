// Angular
import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';

//Blockframes
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Twilio
import {Participant, RemoteAudioTrack, RemoteDataTrack, RemoteTrackPublication, RemoteVideoTrack} from 'twilio-video';

@Component({
  selector: 'event-meeting-dominant-speaker',
  templateUrl: './dominant-speaker.component.html',
  styleUrls: ['./dominant-speaker.component.scss']
})
export class DominantSpeakerComponent extends AbstractParticipant implements AfterViewInit {

  @Input() participant: IParticipantMeeting
  @Input() twilioData: Participant

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
      this.setUpVideoAndAudio(track.kind, false)
    })

    participant.on(meetingEventEnum.TrackEnabled, (track: RemoteTrackPublication) => {
      this.attachTracks([this.getTrackFromRemoteTrackPublication(track)], containerRemotParticipant)
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.on(meetingEventEnum.TrackStarted, (track: RemoteTrackPublication) => {
      this.setUpVideoAndAudio(track.kind, true)
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

  /**
   * Set up Video and Audio of dominant speaker
   * @param tracks
   * @param boolToChange: boolean
   */
  setUpCamAndMic(tracks, boolToChange: boolean) {
    if (tracks.length < 1) {
      this.$camMicIsOnDataSource.next({video: false, audio: false});
    } else {
      tracks.forEach((track) => {
        this.setUpVideoAndAudio(track.kind, boolToChange)
      })
    }
  }
}
