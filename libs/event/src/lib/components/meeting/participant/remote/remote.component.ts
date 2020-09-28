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
  styleUrls: ['./remote.component.scss']
})
export class RemoteComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  // FIXME
  // Make Participant interfce !!
  @Input() participant: any

  @Output() eventParticipantDeconected = new EventEmitter();

  private $remoteCamMicIsOnDataSource: BehaviorSubject<any> = new BehaviorSubject({cam: false, mic: false});
  remoteCamMicIsOn$: Observable<any> = this.$remoteCamMicIsOnDataSource.asObservable();

  containerOfVideo;

  constructor(private renderer: Renderer2, private elm: ElementRef) {
    super();
  }

  ngOnInit(): void {
    console.log('ParticipantComponent ngOnInit participant : ', this.participant)
  }

  ngAfterViewInit() {
    this.mocDivVideo(this.participant);
    this.setUpRemoteParticipantEvent(this.participant);
  }

  changeRemoteCamMicIsOnDataSource(kind, boolToChange){
    console.log('changeRemoteCamMicIsOnDataSource : ', {kind, boolToChange})
    if(kind === 'video'){
      this.$remoteCamMicIsOnDataSource.next( {...this.$remoteCamMicIsOnDataSource.getValue(), cam: boolToChange});
    } else {
      this.$remoteCamMicIsOnDataSource.next( {...this.$remoteCamMicIsOnDataSource.getValue(), audio: boolToChange});
    }
  }


  /**
   *
   * @param participant
   */
  setUpRemoteParticipantEvent(participant){
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
      this.changeRemoteCamMicIsOnDataSource(track.kind, false)
    })

    participant.on('trackEnabled', (track) => {
      console.log(`============================== trackEnabled in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackPublished', () => {
      console.log(`============================== trackPublished in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackStarted', (track) => {
      console.log(`============================== trackStarted in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      this.changeRemoteCamMicIsOnDataSource(track.kind, true)
    })

    participant.on('trackSubscriptionFailed', () => {
      console.log(`============================== trackSubscriptionFailed in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackSwitchedOff', (track) => {
      console.log(`============================== trackSwitchedOff in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      this.changeRemoteCamMicIsOnDataSource(track.kind, false)
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

    const containerRemotParticipant = this.elm.nativeElement.querySelector('#remote-video-participant');

    //Cretion div name/lastName participant
    const containerNameParticipant = this.renderer.createElement('div');
    const text = this.renderer.createText(`${participant.firstName} / ${participant.lastName}`);
    this.renderer.appendChild(containerNameParticipant, text);
    this.renderer.setProperty(containerNameParticipant, 'id', `nameParticipant`);

    this.containerOfVideo = this.renderer.createElement('div');

    this.renderer.setProperty(this.containerOfVideo, 'id', `container-video-${participant.identity}`);
    this.renderer.addClass(this.containerOfVideo, `remoteVideo`);
    this.renderer.appendChild(containerRemotParticipant, this.containerOfVideo);
    this.renderer.appendChild(this.containerOfVideo, containerNameParticipant);
    this.attachParticipantTracks(participant, this.containerOfVideo, 'remoteParticipant');

  }

  /**
   *
   *
   <div *ngIf="!!remoteCamMicIsOn" class="name-participant">
   {{participant.firstName}} / {{participant.lastName}}
   </div>
   */
}
