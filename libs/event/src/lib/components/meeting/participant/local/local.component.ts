import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  Input,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import {
  meetingEventEnum,
  MeetingService,
  StatusVideoMic
} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {Participant, RemoteTrackPublication as IRemoteTrackPublication, LocalTrackPublication} from 'twilio-video';
import {Observable} from "rxjs";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";


@Component({
  selector: 'event-meeting-local-participant',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalComponent extends AbstractParticipant implements OnInit, AfterViewInit {

  @Input() localParticipant: IParticipantMeeting;
  @Input() localPreviewTracks: LocalTrackPublication;

  @Output() eventSetUpLocalVideoAndAudio =  new EventEmitter();

  @ViewChild('localVideo') containerLocalVideo;

  localVideoAudioIsOn$: Observable<StatusVideoMic>

  videoIsOn: boolean;
  audioIsOn: boolean;

  constructor(protected cd: ChangeDetectorRef, private meetinService: MeetingService) {
    super(cd);
    this.localVideoAudioIsOn$ = this.meetinService.getLocalVideoMicStatus();
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

    localParticipant.twilioData.on(meetingEventEnum.TrackSubscribed, (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic([track], true);

    })

    localParticipant.twilioData.on(meetingEventEnum.TrackUnsubscribed, (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic([track], false);

    })

    localParticipant.twilioData.on('trackDisabled', (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic([track], false);

    })

    localParticipant.twilioData.on('trackEnabled', (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic([track], true);

    })

    localParticipant.twilioData.on('trackStopped', (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic([track], false);

    })
  }

  /**
   *
   * @param kind
   * @param boolToChange
   */
  setUpVideoAndAudio(kind: string, boolToChange: boolean){
    this.eventSetUpLocalVideoAndAudio.emit({kind, boolToChange});
  }

  /**
   *
   * @param localPreviewTracks
   */
  makeLocalTrack(localPreviewTracks: IRemoteTrackPublication[]){
    this.setUpCamAndMic(localPreviewTracks, true);
    this.attachTracks(localPreviewTracks, this.containerLocalVideo.nativeElement, 'localVideo')
  }

  setUpCamAndMic(tracks, boolToChange){
    if(tracks.length < 1){
      this.setUpVideoAndAudio('audio', false)
      this.setUpVideoAndAudio('video', false)
    } else {
      tracks.forEach((track) => {
        this.setUpVideoAndAudio(track.kind, boolToChange)
      })
    }
  }

}
