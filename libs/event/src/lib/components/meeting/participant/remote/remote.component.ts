import {
  AfterViewChecked,
  AfterViewInit, ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'event-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteComponent extends AbstractParticipant implements OnInit {

  // FIXME
  // Make Participant interfce !!
  @Input() participant: any

  @Output() eventParticipantDeconected = new EventEmitter();

  private $remoteCamIsDeactivedDataSource: BehaviorSubject<boolean> = new BehaviorSubject(true);
  remoteCamIsDeactived$: Observable<any> = this.$remoteCamIsDeactivedDataSource.asObservable();

  private $remoteMicIsDeactivedDataSource: BehaviorSubject<boolean> = new BehaviorSubject(true);
  remoteMicIsDeactived$: Observable<any> = this.$remoteMicIsDeactivedDataSource.asObservable();

  containerOfVideo;

  constructor(private renderer: Renderer2, private elm: ElementRef) {
    super();
  }

  ngOnInit(): void {
    console.log('ParticipantComponent ngOnInit participant : ', this.participant)
    this.mocDivVideo(this.participant);
    this.setUpRemoteParticipantEvent(this.participant);
  }

  /**
   *
   * @param participant
   */
  setUpRemoteParticipantEvent(participant){
    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);

    participant.on(meetingEventEnum.TrackSubscribed, (track) => {
      console.log(`============================== trackSubscribed in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      if(track.kind === 'video'){
        this.$remoteCamIsDeactivedDataSource.next(false)
      } else {
        this.$remoteMicIsDeactivedDataSource.next(false)
      }
      this.attachTracks([track], containerRemotParticipant, 'remoteParticipant')
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      console.log(`============================== trackUnsubscribed in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      if(track.kind === 'video'){
        this.$remoteCamIsDeactivedDataSource.next(true)
      } else {
        this.$remoteMicIsDeactivedDataSource.next(true)
      }
      this.detachTracks([track])
    })

    participant.on('disconnected', () => {
      console.log(`============================== disconnected in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      this.eventParticipantDeconected.emit(this.participant)
    })

    participant.on('reconnected', () => {
      console.log(`============================== reconnected in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('reconnecting', () => {
      console.log(`============================== reconnecting in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackDisabled', (track) => {
      console.log(`============================== trackDisabled in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      if(track.kind === 'video'){
        this.$remoteCamIsDeactivedDataSource.next(true)
      } else {
        this.$remoteMicIsDeactivedDataSource.next(true)
      }
    })

    participant.on('trackEnabled', (track) => {
      console.log(`============================== trackEnabled in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      if(track.kind === 'video'){
        this.$remoteCamIsDeactivedDataSource.next(false)
      } else {
        this.$remoteMicIsDeactivedDataSource.next(false)
      }
    })

    participant.on('trackPublished', () => {
      console.log(`============================== trackPublished in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackStarted', (track) => {
      console.log(`============================== trackStarted in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      if(track.kind === 'video'){
        this.$remoteCamIsDeactivedDataSource.next(false)
      } else {
        this.$remoteMicIsDeactivedDataSource.next(false)
      }
    })

    participant.on('trackSubscriptionFailed', () => {
      console.log(`============================== trackSubscriptionFailed in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackSwitchedOff', (track) => {
      console.log(`============================== trackSwitchedOff in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      if(track.kind === 'video'){
        this.$remoteCamIsDeactivedDataSource.next(true)
      } else {
        this.$remoteMicIsDeactivedDataSource.next(true)
      }
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
  mocDivVideo(participant){

    const containerRemotParticipant = this.elm.nativeElement.querySelector('#remote-participant');

    this.containerOfVideo = this.renderer.createElement('div');

    this.renderer.setProperty(this.containerOfVideo, 'id', `container-video-${participant.identity}`);
    this.renderer.setProperty(this.containerOfVideo, 'class', `remoteVideo`);
    this.renderer.appendChild(containerRemotParticipant, this.containerOfVideo);
    this.attachParticipantTracks(participant, containerRemotParticipant, 'remoteParticipant');

  }
}
