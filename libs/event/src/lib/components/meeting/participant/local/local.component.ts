import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {meetingEventEnum, IStatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import {LocalTrackPublication, Participant, RemoteTrackPublication as IRemoteTrackPublication} from 'twilio-video';
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
  @Input() isSeller: boolean;
  @Input() localVideoAudioIsOn: IStatusVideoMic;
  @Input() twilioData: Participant

  @Output() eventSetUpLocalVideoAndAudio = new EventEmitter();

  @ViewChild('localVideo') containerLocalVideo: ElementRef;

  open = true;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.open = !this.isSeller;
  }

  ngAfterViewInit() {
    this.setUpLocalParticipantEvent(this.twilioData);
    this.makeLocalTrack();
  }

  /**
   *
   * @param localParticipant
   */
  setUpLocalParticipantEvent(localParticipant: Participant) {

    localParticipant.on(meetingEventEnum.TrackDisabled, (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic([track], false);
    })

    localParticipant.on(meetingEventEnum.TrackEnabled, (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic([track], true);
      console.log(this.localVideoAudioIsOn)
      this.makeLocalTrack();
    })

    localParticipant.on(meetingEventEnum.TrackStopped, (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic([track], false);
    })
  }

  /**
   *
   * @param kind
   * @param boolToChange
   */
  setUpVideoAndAudio(kind: string, boolToChange: boolean) {
    this.eventSetUpLocalVideoAndAudio.emit({kind, boolToChange});
  }

  /**
   *
   */
  makeLocalTrack() {
    this.attachTracks(this.localPreviewTracks, this.containerLocalVideo.nativeElement)
  }

  setUpCamAndMic(tracks, boolToChange) {
    if (tracks.length < 1) {
      this.setUpVideoAndAudio('audio', false)
      this.setUpVideoAndAudio('video', false)
    } else {
      tracks.forEach((track) => {
        this.setUpVideoAndAudio(track.kind, boolToChange)
      })
    }
  }
}
