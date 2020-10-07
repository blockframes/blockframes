import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {Participant, RemoteTrackPublication, RemoteAudioTrack, RemoteVideoTrack, RemoteDataTrack} from 'twilio-video';
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: 'event-meeting-dominant-speaker',
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

    participant.twilioData.on(meetingEventEnum.TrackSubscribed, (track) => {
      this.attachTracks([track], containerRemotParticipant, 'dominantSpeakerVideo')
    })

    participant.twilioData.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      this.detachTracks([track])
    })

    participant.twilioData.on('disconnected', () => {
      this.detachParticipantTracks(this.participant);
    })

    participant.twilioData.on('reconnected', () => {
    })

    participant.twilioData.on('reconnecting', () => {
    })

    participant.twilioData.on('trackDisabled', (track:RemoteTrackPublication) => {
      this.detachTracks([this.getTrackFromRemoteTrackPublication(track)])
      this.setUpVideoAndAudio(track.kind, false)
    })

    participant.twilioData.on('trackEnabled', (track:RemoteTrackPublication) => {
      this.attachTracks([this.getTrackFromRemoteTrackPublication(track)], containerRemotParticipant, 'dominantSpeakerVideo')
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.twilioData.on('trackPublished', (track) => {
    })

    participant.twilioData.on('trackStarted', (track) => {
      // this.setTrackEvent(track);
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.twilioData.on('trackSubscriptionFailed', (track) => {
    })

    participant.twilioData.on('trackSwitchedOff', (track) => {
    })

    participant.twilioData.on('trackSwitchedOn', (track) => {
    })

    participant.twilioData.on('trackUnpublished', (track) => {
    })
  }

  getTrackFromRemoteTrackPublication(trackPublication:RemoteTrackPublication): RemoteVideoTrack | RemoteAudioTrack | RemoteDataTrack {
    return trackPublication.track;
  }

  /**
   *
   * @param participants
   */
  makeDominantSpeakerTrack(participants: IParticipantMeeting){
    this.attachParticipantTracks(participants.twilioData, this.containerDominantSpeakerVideo.nativeElement, 'dominantSpeakerVideo')
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
