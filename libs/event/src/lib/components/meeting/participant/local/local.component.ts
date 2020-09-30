import {AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {Participant as IParticipantMeeting, Track as ITrack} from 'twilio-video';


@Component({
  selector: 'event-local-participant',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  @Input() localParticipant: IParticipantMeeting;
  // FIXME make interface for localPreviewTracks
  @Input() localPreviewTracks: any;

  @ViewChild('localVideo') containerLocalVideo;

  videoIsOn: boolean;
  audioIsOn: boolean;

  constructor() {
    super();
    this.camMicIsOn$.subscribe((value: any) => {
      this.videoIsOn = value.video;
      this.audioIsOn = value.audio;
    })
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.setUpLocalParticipantEvent(this.localParticipant);
    this.makeLocalTrack(this.localPreviewTracks);
  }

  /**
   *
   * @param localParticipant
   */
  setUpLocalParticipantEvent(localParticipant: IParticipantMeeting){
    console.log('localParticipant : ', localParticipant)

    localParticipant.on(meetingEventEnum.TrackSubscribed, (track: ITrack) => {
      console.log('============================== trackSubscribed in local component============================')
      this.setUpCamAndMic([track], true);

    })

    localParticipant.on(meetingEventEnum.TrackUnsubscribed, (track: ITrack) => {
      console.log('============================== trackUnsubscribed in local component============================')
      this.setUpCamAndMic([track], false);

    })

    localParticipant.on('trackDisabled', (track: ITrack) => {
      console.log('============================== trackDisabled in local component============================')
      this.setUpCamAndMic([track], false);

    })

    localParticipant.on('trackEnabled', (track: ITrack) => {
      console.log('============================== trackEnabled in local component============================')
      this.setUpCamAndMic([track], true);

    })

    localParticipant.on('trackStopped', (track: ITrack) => {
      console.log('============================== trackStopped in local component============================')
      this.setUpCamAndMic([track], false);

    })
  }

  /**
   *
   * @param localPreviewTracks
   */
  makeLocalTrack(localPreviewTracks: ITrack[]){
    this.setUpCamAndMic(localPreviewTracks, true);
    this.attachTracks(localPreviewTracks, this.containerLocalVideo.nativeElement, 'localVideo')
  }

  setUpCamAndMic(tracks, boolToChange){
    if(tracks.length < 1){
      this.$camMicIsOnDataSource.next({video:false, mic:false});
    } else {
      tracks.forEach((track) => {
        this.setUpVideoAndAudio(track.kind, boolToChange)
      })
    }
  }

}
