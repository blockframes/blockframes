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
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {Participant as IParticipantMeeting} from 'twilio-video';
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'event-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteComponent extends AbstractParticipant implements OnInit, AfterViewInit {


  protected $camMicIsOnRemoteDataSource: BehaviorSubject<any> = new BehaviorSubject({video: false, audio: false});
  public camMicIsOnRemote$: Observable<any> = this.$camMicIsOnRemoteDataSource.asObservable();

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
    console.log('ParticipantComponent ngOnInit participant : ', this.participant)
  }

  ngAfterViewInit() {
    this.setUpRemoteParticipantEvent(this.participant);
    this.mocDivVideo(this.participant);
  }

  setTrackEvent(track){
    console.log('setTrackEvent : ', track)
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
      console.log(`============================== trackSubscribed in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)

      this.attachTracks([track], containerRemotParticipant, 'remoteParticipant')
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      console.log(`============================== trackUnsubscribed in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      this.detachTracks([track])
    })

    participant.on('disconnected', () => {
      console.log(`============================== disconnected in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      this.detachParticipantTracks(this.participant);
    })

    participant.on('reconnected', () => {
      console.log(`============================== reconnected in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('reconnecting', () => {
      console.log(`============================== reconnecting in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackDisabled', (track) => {
      console.log(`============================== trackDisabled in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      this.setUpVideoAndAudio(track.kind, false)
    })

    participant.on('trackEnabled', (track) => {
      console.log(`============================== trackEnabled in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackPublished', () => {
      console.log(`============================== trackPublished in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackStarted', (track) => {
      console.log(`============================== trackStarted in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      // this.setTrackEvent(track);
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.on('trackSubscriptionFailed', () => {
      console.log(`============================== trackSubscriptionFailed in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackSwitchedOff', (track) => {
      console.log(`============================== trackSwitchedOff in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackSwitchedOn', () => {
      console.log(`============================== trackSwitchedOn in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackUnpublished', () => {
      console.log(`============================== trackUnpublished in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
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
      console.log('...this.$camMicIsOnDataSource.getValue() : ', this.$camMicIsOnDataSource.getValue())
      this.$camMicIsOnRemoteDataSource.next( {...this.$camMicIsOnRemoteDataSource.getValue(), video: boolToChange});
    } else {
      this.$camMicIsOnRemoteDataSource.next( {...this.$camMicIsOnRemoteDataSource.getValue(), audio: boolToChange});
    }
    this.cd.detectChanges();
  }
}
