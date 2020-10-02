import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2
} from '@angular/core';
import {meetingEventEnum, StatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {BehaviorSubject, Observable} from "rxjs";
import { Participant as IParticipantMeeting, RemoteTrackPublication, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';

@Component({
  selector: 'event-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteComponent extends AbstractParticipant implements OnInit, AfterViewInit {


  protected $camMicIsOnRemoteDataSource: BehaviorSubject<StatusVideoMic> = new BehaviorSubject({video: false, audio: false});
  public camMicIsOnRemote$: Observable<StatusVideoMic> = this.$camMicIsOnRemoteDataSource.asObservable();

  @Input() participant: IParticipantMeeting

  @Input() isBuyer = true;

  videoIsOn: boolean;
  audioIsOn: boolean;

  containerOfVideo;

  constructor(private renderer: Renderer2, private elm: ElementRef, protected cd: ChangeDetectorRef) {
    super(cd);
    this.camMicIsOn$.subscribe((value: any) => {
      this.videoIsOn = value.video;
      this.audioIsOn = value.audio;
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.setUpRemoteParticipantEvent(this.participant);
    this.mocDivVideo(this.participant);
  }

  setTrackEvent(track){
    track.on('dimensionsChanged', (dd)=> {
      console.log('dimensionsChanged : ')
      console.log({dd})
    })
  }


  /**
   *
   * @param participant
   */
  setUpRemoteParticipantEvent(participant: IParticipantMeeting){
    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);

    participant.on(meetingEventEnum.TrackSubscribed, (track) => {

      this.attachTracks([track], containerRemotParticipant, 'remoteParticipant')
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

    participant.on('trackPublished', () => {
    })

    participant.on('trackStarted', (track) => {
      // this.setTrackEvent(track);
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.on('trackSubscriptionFailed', () => {
    })

    participant.on('trackSwitchedOff', (track) => {
    })

    participant.on('trackSwitchedOn', () => {
    })

    participant.on('trackUnpublished', () => {
    })
  }


  /**
   *
   * @param participant
   */
  mocDivVideo(participant: IParticipantMeeting){

    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);

    this.renderer.addClass(containerRemotParticipant, `remoteVideo`);
    this.attachParticipantTracks(participant, containerRemotParticipant, 'remoteParticipant');

  }

  setUpVideoAndAudio(kind, boolToChange){
    if(kind === 'video'){
      this.$camMicIsOnRemoteDataSource.next( {...this.$camMicIsOnRemoteDataSource.getValue(), video: boolToChange});
    } else {
      this.$camMicIsOnRemoteDataSource.next( {...this.$camMicIsOnRemoteDataSource.getValue(), audio: boolToChange});
    }
    this.cd.detectChanges();
  }
}
