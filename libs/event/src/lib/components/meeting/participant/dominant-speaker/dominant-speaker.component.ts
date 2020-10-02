import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import { Participant as IParticipantMeeting, RemoteTrackPublication, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";

@Component({
  selector: 'event-dominant-speaker',
  templateUrl: './dominant-speaker.component.html',
  styleUrls: ['./dominant-speaker.component.scss']
})
export class DominantSpeakerComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  @Input() participant: IParticipantMeeting

  @ViewChild('dominantSpeakerVideo') containerDominantSpeakerVideo;

  constructor(private elm: ElementRef, protected cd: ChangeDetectorRef) {
    super(cd);
  }

  ngOnInit(): void {
  }


  ngAfterViewInit() {
    this.setUpRemoteParticipantEvent(this.participant);
    this.makeDominantSpeakerTrack(this.participant);
  }


  /**
   *
   * @param participant
   */
  setUpRemoteParticipantEvent(participant: IParticipantMeeting){
    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#dominantSpeakerVideo`);

    participant.on(meetingEventEnum.TrackSubscribed, (track) => {
      this.attachTracks([track], containerRemotParticipant, 'dominantSpeakerVideo')
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      this.detachTracks([track])
    })

    participant.on('disconnected', () => {
      this.detachParticipantTracks(this.participant);
    })

    participant.on('reconnected', () => {
    })

    participant.on('reconnecting', () => {
    })

    participant.on('trackDisabled', (track:RemoteTrackPublication) => {
      this.detachTracks([this.getTrackFromRemoteTrackPublication(track)])
      this.setUpVideoAndAudio(track.kind, false)
    })

    participant.on('trackEnabled', (track:RemoteTrackPublication) => {
      this.attachTracks([this.getTrackFromRemoteTrackPublication(track)], containerRemotParticipant, 'dominantSpeakerVideo')
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.on('trackPublished', (track) => {
    })

    participant.on('trackStarted', (track) => {
      // this.setTrackEvent(track);
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.on('trackSubscriptionFailed', (track) => {
    })

    participant.on('trackSwitchedOff', (track) => {
    })

    participant.on('trackSwitchedOn', (track) => {
    })

    participant.on('trackUnpublished', (track) => {
    })
  }

  getTrackFromRemoteTrackPublication(trackPublication:RemoteTrackPublication): RemoteVideoTrack|RemoteAudioTrack {
    return trackPublication.track;
  }

  /**
   *
   * @param participants
   */
  makeDominantSpeakerTrack(participants: IParticipantMeeting){
    this.attachParticipantTracks(participants, this.containerDominantSpeakerVideo.nativeElement, 'dominantSpeakerVideo')
  }

  setUpCamAndMic(tracks, boolToChange){
    if(tracks.length < 1){
      this.$camMicIsOnDataSource.next({video:false, audio:false});
    } else {
      tracks.forEach((track) => {
        this.setUpVideoAndAudio(track.kind, boolToChange)
      })
    }
  }
}
