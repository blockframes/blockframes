import {
  AfterContentInit,
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
import {EventRoom, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'event-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  // FIXME
  // Make Participant interfce !!
  @Input() participant: any

  @Input() isBuyer = true;

  @Output() eventParticipantDeconected = new EventEmitter();

  videoIsOn: boolean;
  audioIsOn: boolean;

  containerOfVideo;

  constructor(private renderer: Renderer2, private elm: ElementRef) {
    super();
    this.camMicIsOn$.subscribe((value: any) => {
      this.videoIsOn = value.video;
      this.audioIsOn = value.audio;
    })
  }

  ngOnInit(): void {
    console.log('ParticipantComponent ngOnInit participant : ', this.participant)
  }

  ngAfterViewInit() {
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
      this.setUpVideoAndAudio(track.kind, true)
    })

    participant.on('trackSubscriptionFailed', () => {
      console.log(`============================== trackSubscriptionFailed in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
    })

    participant.on('trackSwitchedOff', (track) => {
      console.log(`============================== trackSwitchedOff in remote component for participant ${participant.firstName}/${participant.lastName} : ${participant.identity}============================`)
      this.setUpVideoAndAudio(track.kind, false)
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
}
