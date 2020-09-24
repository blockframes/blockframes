import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'event-local-participant',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.css']
})
export class LocalComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  // FIXME
  // make interface for participant
  @Input() localParticipant: any;
  @Input() localPreviewTracks: any;

  @ViewChild('localVideo') containerLocalVideo;

  private $camIsDeactivedDataSource: BehaviorSubject<boolean> = new BehaviorSubject(true);
  camIsDeactived$: Observable<any> = this.$camIsDeactivedDataSource.asObservable();

  private $micIsDeactivedDataSource: BehaviorSubject<boolean> = new BehaviorSubject(true);
  micIsDeactived$: Observable<any> = this.$micIsDeactivedDataSource.asObservable();

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.makeLocalTrack(this.localPreviewTracks, this.localParticipant);
    this.testEventLocalParticipant(this.localParticipant);

  }

  testEventLocalParticipant(localParticipant){
    console.log('localParticipant : ', localParticipant)

    localParticipant.on(meetingEventEnum.TrackSubscribed, (track) => {
      console.log('============================== trackSubscribed in local component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(false)
      } else {
        this.$micIsDeactivedDataSource.next(false)
      }
    })

    localParticipant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      console.log('============================== trackUnsubscribed in local component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(true)
      } else {
        this.$micIsDeactivedDataSource.next(true)
      }
    })

    localParticipant.on('trackDisabled', (track) => {
      console.log('============================== trackDisabled in local component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(true)
      } else {
        this.$micIsDeactivedDataSource.next(true)
      }
    })

    localParticipant.on('trackEnabled', (track) => {
      console.log('============================== trackEnabled in local component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(false)
      } else {
        this.$micIsDeactivedDataSource.next(false)
      }
    })

    localParticipant.on('trackStopped', (track) => {
      console.log('============================== trackStopped in local component============================')
      if(track.kind === 'video'){
        this.$camIsDeactivedDataSource.next(true)
      } else {
        this.$micIsDeactivedDataSource.next(true)
      }
    })
  }

  makeLocalTrack(localPreviewTracks){
    console.log('this.containerLocalVideo.nativeElement : ', this.containerLocalVideo.nativeElement)

    // this.renderer.appendChild(this.containerLocalVideo.nativeElement, )
    this.attachTracks(localPreviewTracks, this.containerLocalVideo.nativeElement, 'localVideo')
  }

}
