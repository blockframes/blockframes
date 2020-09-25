import {AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'event-local-participant',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  // FIXME
  // make interface for participant
  @Input() localParticipant: any;
  @Input() localPreviewTracks: any;

  @ViewChild('localVideo') containerLocalVideo;

  private $localCamIsDeactivedDataSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  localCamIsDeactived$: Observable<boolean> = this.$localCamIsDeactivedDataSource.asObservable();

  private $localMicIsDeactivedDataSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  localMicIsDeactived$: Observable<boolean> = this.$localMicIsDeactivedDataSource.asObservable();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.setUpLocalParticipantEvent(this.localParticipant);

  }

  ngAfterViewInit() {
    this.makeLocalTrack(this.localPreviewTracks);
  }

  /**
   *
   * @param localParticipant
   */
  setUpLocalParticipantEvent(localParticipant){
    console.log('localParticipant : ', localParticipant)

    localParticipant.on(meetingEventEnum.TrackSubscribed, (track) => {
      console.log('============================== trackSubscribed in local component============================')
      if(track.kind === 'video'){
        this.$localCamIsDeactivedDataSource.next(false)
      } else {
        this.$localMicIsDeactivedDataSource.next(false)
      }
    })

    localParticipant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      console.log('============================== trackUnsubscribed in local component============================')
      if(track.kind === 'video'){
        this.$localCamIsDeactivedDataSource.next(true)
      } else {
        this.$localMicIsDeactivedDataSource.next(true)
      }
    })

    localParticipant.on('trackDisabled', (track) => {
      console.log('============================== trackDisabled in local component============================')
      if(track.kind === 'video'){
        this.$localCamIsDeactivedDataSource.next(true)
      } else {
        this.$localMicIsDeactivedDataSource.next(true)
      }
    })

    localParticipant.on('trackEnabled', (track) => {
      console.log('============================== trackEnabled in local component============================')
      if(track.kind === 'video'){
        this.$localCamIsDeactivedDataSource.next(false)
      } else {
        this.$localMicIsDeactivedDataSource.next(false)
      }
    })

    localParticipant.on('trackStopped', (track) => {
      console.log('============================== trackStopped in local component============================')
      if(track.kind === 'video'){
        this.$localCamIsDeactivedDataSource.next(true)
      } else {
        this.$localMicIsDeactivedDataSource.next(true)
      }
    })
  }

  /**
   *
   * @param localPreviewTracks
   */
  makeLocalTrack(localPreviewTracks: Array<any>){
    let camOK = false;
    let micOK = false;
    localPreviewTracks.forEach(track => {
      if(track.kind === 'video') {
        camOK = true;
        this.$localCamIsDeactivedDataSource.next(false);
      } else {
        micOK = true;
        this.$localMicIsDeactivedDataSource.next(false);
      }
    })

    if(!camOK) {
      this.$localCamIsDeactivedDataSource.next(true);
    }

    if(!camOK) {
      this.$localMicIsDeactivedDataSource.next(true);
    }

    this.attachTracks(localPreviewTracks, this.containerLocalVideo.nativeElement, 'localVideo')
  }

}
