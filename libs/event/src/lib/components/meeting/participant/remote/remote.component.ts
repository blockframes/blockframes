import {AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'event-remote-participant',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.css']
})
export class RemoteComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  // FIXME
  // Make Participant interfce !!
  @Input() participant: any

  private $camIsDeactivedDataSource: BehaviorSubject<boolean> = new BehaviorSubject(true);
  camIsDeactived$: Observable<any> = this.$camIsDeactivedDataSource.asObservable();

  private $micIsDeactivedDataSource: BehaviorSubject<boolean> = new BehaviorSubject(true);
  micIsDeactived$: Observable<any> = this.$micIsDeactivedDataSource.asObservable();

  containerOfVideo;

  constructor(private renderer: Renderer2, private elm: ElementRef) {
    super();
  }

  ngOnInit(): void {
    console.log('ParticipantComponent ngOnInit participant : ', this.participant)
    this.mocDivVideo(this.participant);
    this.testEventParticipant(this.participant);
  }

  ngAfterViewInit() {
  }

  testEventParticipant(participant){
    console.log('/////////////////////////////////////////')
    console.log('participant : ', participant.lastName)
    console.log('/////////////////////////////////////////')
    const containerRemotParticipant = this.elm.nativeElement.querySelector(`#container-video-${participant.identity}`);

    participant.on(meetingEventEnum.TrackSubscribed, (track) => {
      console.log('============================== trackSubscribed in remote component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(false)
      } else {
        this.$micIsDeactivedDataSource.next(false)
      }
      this.attachTracks([track], containerRemotParticipant, 'remoteParticipant')
    })

    participant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      console.log('============================== trackUnsubscribed in remote component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(true)
      } else {
        this.$micIsDeactivedDataSource.next(true)
      }
      this.detachTracks([track])
    })

    participant.on('disconnected', () => {
      console.log('============================== disconnected in remote component============================')
    })

    participant.on('reconnected', () => {
      console.log('============================== reconnected in remote component============================')
    })

    participant.on('reconnecting', () => {
      console.log('============================== reconnecting in remote component============================')
    })

    participant.on('trackDimensionsChanged', () => {
      console.log('============================== trackDimensionsChanged in remote component============================')
    })

    participant.on('trackDisabled', (track) => {
      console.log('============================== trackDisabled in remote component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(true)
      } else {
        this.$micIsDeactivedDataSource.next(true)
      }
    })

    participant.on('trackEnabled', (track) => {
      console.log('============================== trackEnabled in remote component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(false)
      } else {
        this.$micIsDeactivedDataSource.next(false)
      }
    })

    participant.on('trackMessage', () => {
      console.log('============================== trackMessage in remote component============================')
    })

    participant.on('trackPublishPriorityChanged', () => {
      console.log('============================== trackPublishPriorityChanged in remote component============================')
    })

    participant.on('trackPublished', () => {
      console.log('============================== trackPublished in remote component============================')
    })

    participant.on('trackStarted', (track) => {
      console.log('============================== trackStarted in remote component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(false)
      } else {
        this.$micIsDeactivedDataSource.next(false)
      }
    })

    participant.on('trackSubscriptionFailed', () => {
      console.log('============================== trackSubscriptionFailed in remote component============================')
    })

    participant.on('trackSwitchedOff', (track) => {
      console.log('============================== trackSwitchedOff in remote component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(true)
      } else {
        this.$micIsDeactivedDataSource.next(true)
      }
    })

    participant.on('trackSwitchedOn', () => {
      console.log('============================== trackSwitchedOn in remote component============================')
    })

    participant.on('trackUnpublished', () => {
      console.log('============================== trackUnpublished in remote component============================')
    })
  }

  makeRemoteTrack(){
    // console.log('this.containerLocalVideo.nativeElement : ', this.containerRemoteVideo.nativeElement)

    // this.renderer.appendChild(this.containerLocalVideo.nativeElement, )
    // this.attachTracks(localPreviewTracks, this.containerLocalVideo.nativeElement, 'localVideo')
  }

  mocDivVideo(participant){

    const containerRemotParticipant = this.elm.nativeElement.querySelector('#remote-participant');

    this.containerOfVideo = this.renderer.createElement('div');

    this.renderer.setProperty(this.containerOfVideo, 'id', `container-video-${participant.identity}`);
    this.renderer.setProperty(this.containerOfVideo, 'class', `remoteVideo`);
    this.renderer.appendChild(containerRemotParticipant, this.containerOfVideo);
    this.attachParticipantTracks(participant, containerRemotParticipant, 'remoteParticipant');

  }
}
