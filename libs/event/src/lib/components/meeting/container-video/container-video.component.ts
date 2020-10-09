import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Event, EventService} from "@blockframes/event/+state";
import {Observable} from "rxjs";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";
import {ErrorResultResponse} from "@blockframes/utils/utils";
import {LocalAudioTrack, LocalVideoTrack} from 'twilio-video';
import {User} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: 'event-meeting-container-video',
  templateUrl: './container-video.component.html',
  styleUrls: ['./container-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerVideoComponent implements OnInit, OnDestroy {

  //Input event meeting
  @Input() event: Event;

  accessToken: string = null;

  //All Participants in the room Twilio
  arrayOfParticipantConnected$: Observable<IParticipantMeeting[]>;

  //Participant local in the room
  localParticipantConnected$: Observable<IParticipantMeeting>;

  //Dominant Participant for Buyer
  dominantParticipantForBuyer$: Observable<IParticipantMeeting>;

  localPreviewTracks$: Observable<Array<LocalAudioTrack | LocalVideoTrack>>;

  user: User;

  constructor(private eventService: EventService,
              private meetingService: MeetingService) {

    this.localPreviewTracks$ = this.meetingService.getLocalPreviewTracks();
    this.arrayOfParticipantConnected$ = this.meetingService.getConnectedAllParticipants();
    this.localParticipantConnected$ = this.meetingService.getConnectedLocalParticipant();
    this.dominantParticipantForBuyer$ = this.meetingService.getConnectedDominantParticipant();
  }

  async ngOnInit() {


    this.user = this.meetingService.getActiveUser();

    const audio = await this.meetingService.getIfAudioIsAvailable();
    const video = await this.meetingService.getIfVideoIsAvailable();
    await this.meetingService.createLocalPreview();

    /**
     *
     */
    this.eventService.getTwilioAccessToken(this.event.id).then((value: ErrorResultResponse) => {
      if (value.error !== '') {
      } else {
        this.accessToken = value.result;
        this.meetingService.connectToTwilioRoom(this.accessToken,
          {
            name: this.event.id, dominantSpeaker: true, audio, video,
            bandwidthProfile: {
              video: {
                renderDimensions: {
                  low: {width: 640, height: 480},
                  standard: {width: 640, height: 480},
                  high: {width: 640, height: 480},
                }
              },
            },
            networkQuality: {local: 1, remote: 1},
            preferredVideoCodecs: [{codec: 'VP8', simulcast: true}],
            width: 640, height: 480
          }, this.event);
      }
    })
  }

  /**
   *
   * @param kind
   * @param boolToChange
   */
  setUpLocalVideoAndAudio({kind, boolToChange}) {
    this.meetingService.setUpLocalVideoAndAudio(kind, boolToChange)
  }

  /**
   *
   */
  ngOnDestroy() {
    this.meetingService.disconnected()
  }
}
