import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {Event, EventService} from "@blockframes/event/+state";
import {BehaviorSubject, Observable} from "rxjs";
import {
  EventRoom,
  meetingEventEnum,
  MeetingService
} from "@blockframes/event/components/meeting/+state/meeting.service";
import {ErrorResultResponse} from "@blockframes/utils/utils";
import {Participant, LocalAudioTrack, LocalVideoTrack} from 'twilio-video';
import {User} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: 'event-meeting-container-video',
  templateUrl: './container-video.component.html',
  styleUrls: ['./container-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerVideoComponent implements OnInit, AfterViewInit, OnDestroy {

  //Input event meeting
  @Input() event: Event;

  accessToken: string = null;


  arrayOfParticipantConnected$: Observable<IParticipantMeeting[]>;

  //Participant local in the room
  // private $localParticipantConnectedDataSource: BehaviorSubject<IParticipantMeeting> = new BehaviorSubject(null);
  localParticipantConnected$: Observable<IParticipantMeeting>;

  //Dominant Participant for Buyer
  // private $dominantParticipantForBuyerDataSource: BehaviorSubject<IParticipantMeeting> = new BehaviorSubject(null);
  dominantParticipantForBuyer$: Observable<IParticipantMeeting>;

  localPreviewTracks$: Observable<Array<LocalAudioTrack | LocalVideoTrack>>;

  user: User;

  constructor(private eventService: EventService,
              private meetingService: MeetingService, private cd: ChangeDetectorRef) {


    //construct listener to the meetingEvent
    this.meetingService.getEventRoom().subscribe((value: EventRoom) => {
      switch (value.meetingEvent) {
        case meetingEventEnum.ParticipantConnected:
          this.participantConnected(value.data);
          break;
        case meetingEventEnum.ParticipantDisconnected:
          this.participantDisconnected(value.data);
          break;
        case meetingEventEnum.ConnectedToRoomTwilio:
          this.connectedToRoomTwilio(value.data);
          break;
        case meetingEventEnum.LocalPreviewDone:
          this.localPreviewDone(value.data);
          break;
        case meetingEventEnum.DominantSpeakerChanged:
          this.dominantSpeakerChanged(value.data);
          break;
      }
    })

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

  ngAfterViewInit() {

    // const img = document.querySelector("#contener-event-meeting");
    // const width = img.clientWidth;
    // const height = img.clientHeight;

  }

  /**
   * Get the user connected is the reel Owner of the room (event.organizedBy.uid)
   */
  getIfIsReelOwner() {
    return this.meetingService.getIfIsReelOwner(this.event);
  }

  /**
   * Function call when event localPreview is done and past to the observable localPreviewTracks$
   * @param localTrack : Array of tracks - all tracks of the local (audio or/and video)
   */
  localPreviewDone(localTrack) {
    this.meetingService.changeLocalTrack(localTrack);
  }

  /**
   * Function call when event connectedToRoomTwilio
   * @param room: Room (object twilio)
   * @param localMeetingParticipant: IParticipantMeeting
   */
  connectedToRoomTwilio({room, localMeetingParticipant}) {
    this.meetingService.changeConnectedAllParticipants(localMeetingParticipant, true);
  }

  /**
   * Function call when participant conncted to the room
   * @param participant: IParticipantMeeting (object twilio)
   */
  participantConnected(participant: IParticipantMeeting) {
    this.meetingService.changeConnectedAllParticipants(participant, true);
  }

  /**
   * Function call when participant disconnected to the room
   * @param participant: IParticipantMeeting (object twilio)
   */
  participantDisconnected(participant: IParticipantMeeting) {
    this.meetingService.changeConnectedAllParticipants(participant, false);
  }

  /**
   *
   */
  dominantSpeakerChanged(participant: IParticipantMeeting) {
    // this.setParticipantDominantSpeaker(participant);
  }


  setUpLocalVideoAndAudio({kind, boolToChange}) {
    this.meetingService.setUpLocalVideoAndAudio(kind, boolToChange)
  }

  ngOnDestroy() {
    this.meetingService.disconnected()
  }
}
