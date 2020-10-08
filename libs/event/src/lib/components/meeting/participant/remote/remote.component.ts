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
import {RemoteTrackPublication} from 'twilio-video';
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: 'event-meeting-remote-participant',
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

    participant.twilioData.on(meetingEventEnum.TrackSubscribed, (track) => {

      this.attachTracks([track], containerRemotParticipant, 'remoteParticipant')
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

    participant.twilioData.on('trackPublished', () => {
    })

    participant.twilioData.on('trackStarted', (track) => {
      // this.setTrackEvent(track);
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.twilioData.on('trackSubscriptionFailed', () => {
    })

    participant.twilioData.on('trackSwitchedOff', (track) => {
    })

    participant.twilioData.on('trackSwitchedOn', () => {
    })

    participant.twilioData.on('trackUnpublished', () => {
    })
  }


  /**
   *
   * @param participant
   */
  mocDivVideo(participant: IParticipantMeeting){

    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);

    this.renderer.addClass(containerRemotParticipant, `remoteVideo`);
    this.attachParticipantTracks(participant.twilioData, containerRemotParticipant, 'remoteParticipant');

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
