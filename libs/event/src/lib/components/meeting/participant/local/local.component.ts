import {AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'event-local-participant',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss']
})
export class LocalComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  // FIXME make interface for participant
  @Input() localParticipant: any;
  @Input() localPreviewTracks: any;

  @ViewChild('localVideo') containerLocalVideo;

  private $localCamMicIsOnDataSource: BehaviorSubject<any> = new BehaviorSubject({cam: false, mic: false});
  localCamMicIsOn$: Observable<any> = this.$localCamMicIsOnDataSource.asObservable();
  localCamIsOn = false;
  localMicIsOn = false;

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
      this.setUpCamAndMic([track], true);

    })

    localParticipant.on(meetingEventEnum.TrackUnsubscribed, (track) => {
      console.log('============================== trackUnsubscribed in local component============================')
      this.setUpCamAndMic([track], false);

    })

    localParticipant.on('trackDisabled', (track) => {
      console.log('============================== trackDisabled in local component============================')
      this.setUpCamAndMic([track], false);

    })

    localParticipant.on('trackEnabled', (track) => {
      console.log('============================== trackEnabled in local component============================')
      this.setUpCamAndMic([track], true);

    })

    localParticipant.on('trackStopped', (track) => {
      console.log('============================== trackStopped in local component============================')
      this.setUpCamAndMic([track], false);

    })
  }

  /**
   *
   * @param localPreviewTracks
   */
  makeLocalTrack(localPreviewTracks: Array<any>){
    this.setUpCamAndMic(localPreviewTracks, true);
    this.attachTracks(localPreviewTracks, this.containerLocalVideo.nativeElement, 'localVideo')
  }

  setUpCamAndMic(tracks, boolToChange){
    console.log({tracks, boolToChange})
    if(tracks.length < 1){
      this.$localCamMicIsOnDataSource.next({cam:false, mic:false});
    } else {
      tracks.forEach((track) => {
        if(track.kind === 'video'){
          console.log('track.kind : ', track.kind)
          this.$localCamMicIsOnDataSource.next( {...this.$localCamMicIsOnDataSource.getValue(), cam: boolToChange});
        } else {
          this.$localCamMicIsOnDataSource.next( {...this.$localCamMicIsOnDataSource.getValue(), audio: boolToChange});
        }
      })
    }
  }

}
