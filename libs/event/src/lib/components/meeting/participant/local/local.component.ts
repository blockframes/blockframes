// Angular
import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

// Blockframes
import {IParticipantMeeting, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";

// Twilio
import {Participant, RemoteTrackPublication as IRemoteTrackPublication} from 'twilio-video';


@Component({
  selector: '[isOpen] [localParticipant] [twilioData] event-meeting-local-participant',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss']
})
export class LocalComponent extends AbstractParticipant implements OnInit, AfterViewInit, OnDestroy {

  @Input() isOpen: boolean;
  @Input() localParticipant: IParticipantMeeting;
  @Input() twilioData: Participant

  @ViewChild('localVideo') containerLocalVideo: ElementRef;

  open = true;

  constructor(private meetingService: MeetingService) {
    super();
  }

  ngOnInit(): void {
    // FIXME
    // this.open = !this.isSeller;
  }

  ngAfterViewInit() {
    this.setUpLocalParticipantEvent(this.twilioData);
    this.attachParticipantTracks(this.twilioData, this.containerLocalVideo.nativeElement);
  }

  /**
   *
   * @param localParticipant
   */
  setUpLocalParticipantEvent(localParticipant: Participant) {

    localParticipant.on(meetingEventEnum.TrackDisabled, (track: IRemoteTrackPublication) => {
      this.setupVideoAudio(track.kind, false);
    })

    localParticipant.on(meetingEventEnum.TrackEnabled, (track: IRemoteTrackPublication) => {
      this.setupVideoAudio(track.kind, true);
    })

    localParticipant.on(meetingEventEnum.TrackStopped, (track: IRemoteTrackPublication) => {
      this.setupVideoAudio(track.kind, false);
    })
  }

  setupVideoAudio(kind, boolToChange) {
    this.meetingService.setupVideoAudio(this.localParticipant.identity, kind, boolToChange);
  }

  ngOnDestroy() {
    this.detachParticipantTracks(this.twilioData);
    this.twilioData.removeAllListeners();
  }
}
