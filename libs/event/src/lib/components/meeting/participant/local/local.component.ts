// Angular
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// Blockframes
import {
  IParticipantMeeting,
  IStatusVideoAudio,
  meetingEventEnum
} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

// Twilio
import {Participant, RemoteTrackPublication as IRemoteTrackPublication} from 'twilio-video';


@Component({
  selector: '[localParticipant] [localPreviewTracks] [isSeller] [localVideoAudioIsOn] [twilioData] event-meeting-local-participant',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() localParticipant: IParticipantMeeting;
  @Input() twilioData: Participant

  @ViewChild('localVideo') containerLocalVideo: ElementRef;

  open = true;

  constructor(private meetingService: MeetingService) {
  }

  ngOnInit(): void {
    // FIXME
    // this.open = !this.isSeller;
  }

  ngAfterViewInit() {
    this.setUpLocalParticipantEvent(this.twilioData);
    this.meetingService.attachParticipantTracks(this.twilioData, this.containerLocalVideo.nativeElement);
  }

  /**
   *
   * @param localParticipant
   */
  setUpLocalParticipantEvent(localParticipant: Participant) {

    localParticipant.on(meetingEventEnum.TrackDisabled, (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic(track.kind, false);
    })

    localParticipant.on(meetingEventEnum.TrackEnabled, (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic(track.kind, true);
    })

    localParticipant.on(meetingEventEnum.TrackStopped, (track: IRemoteTrackPublication) => {
      this.setUpCamAndMic(track.kind, false);
    })
  }

  setupVideoAudio(kind: keyof IStatusVideoAudio, boolToChange: boolean): void {
    this.meetingService.setupVideoAudio(this.localParticipant.identity, kind, boolToChange);
  }

  setUpCamAndMic(kind, boolToChange) {
    this.meetingService.setupVideoAudio(this.localParticipant.identity, kind, boolToChange);
  }

  ngOnDestroy() {
    this.meetingService.detachParticipantTracks(this.twilioData);
    this.twilioData.removeAllListeners();
  }
}
