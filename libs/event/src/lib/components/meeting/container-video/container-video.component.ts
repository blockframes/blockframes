import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Event, EventService} from "@blockframes/event/+state";
import {BehaviorSubject, Observable} from "rxjs";
import {
  EventRoom,
  meetingEventEnum,
  MeetingService
} from "@blockframes/event/components/meeting/+state/meeting.service";
import {ErrorResultResponse} from "@blockframes/utils/utils";
import { Participant, LocalAudioTrack, LocalVideoTrack } from 'twilio-video';
import {User} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: 'event-meeting-container-video',
  templateUrl: './container-video.component.html',
  styleUrls: ['./container-video.component.scss']
})
export class ContainerVideoComponent implements OnInit, AfterViewInit, OnDestroy {

  //Input event meeting
  @Input() event: Event;

  accessToken: string = null;

  //Array of participant connected to the room
  public $participantConnectedDataSource: BehaviorSubject<IParticipantMeeting[]> = new BehaviorSubject([]);
  arrayOfParticipantConnected$: Observable<IParticipantMeeting[]> = this.$participantConnectedDataSource.asObservable();

  //Participant local in the room
  private $localParticipantConnectedDataSource: BehaviorSubject<IParticipantMeeting> = new BehaviorSubject(null);
  localParticipantConnected$: Observable<IParticipantMeeting> = this.$localParticipantConnectedDataSource.asObservable();

  //Dominant Participant for Buyer
  private $dominantParticipantForBuyerDataSource: BehaviorSubject<IParticipantMeeting> = new BehaviorSubject(null);
  dominantParticipantForBuyer$: Observable<IParticipantMeeting> = this.$dominantParticipantForBuyerDataSource.asObservable();
  tt = 1;

  private $localPreviewTracksDataSource: BehaviorSubject<Array<LocalAudioTrack|LocalVideoTrack>> = new BehaviorSubject([]);
  localPreviewTracks$: Observable<LocalAudioTrack|LocalVideoTrack> = this.$localPreviewTracksDataSource.asObservable();

  user: User;

  constructor(private eventService: EventService,
              private meetingService: MeetingService, private cd: ChangeDetectorRef) {


    //construct listener to the meetingEvent
    this.meetingService.getEventRoom().subscribe((value: EventRoom) => {
      switch (value.meetingEvent){
        case meetingEventEnum.ParticipantConnected:
          this.participantConnected(value.data);
          break;
        case meetingEventEnum.ParticipantDisconnected:
          this.participantDisconnected(value.data);
          break;
        case meetingEventEnum.Disconnected:
          this.disconnected();
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
  }

  async ngOnInit() {


    this.user = this.meetingService.getActiveUser();

    const audio = await this.meetingService.getIfAudioIsAvailable();
    const video = await this.meetingService.getIfVideoIsAvailable();
    await this.meetingService.createLocalPreview();

    this.$dominantParticipantForBuyerDataSource.next(null);

    this.eventService.getTwilioAccessToken(this.event.id).then((value: ErrorResultResponse) => {
      if(value.error !== ''){
      } else {
        this.accessToken = value.result;
        this.meetingService.connectToTwilioRoom(this.accessToken, { name: this.event.id, dominantSpeaker: true, audio, video,
          bandwidthProfile: {
            video: {
              renderDimensions: {
                low: { width: 640, height: 480 },
                standard: { width: 640, height: 480 },
                high: { width: 640, height: 480 },
              }
            },
          },
          networkQuality: { local: 1, remote: 1 },
          preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
          width: 640, height: 480}, this.event);


        // let t = {
        //   bandwidthProfile: {
        //     video: {
        //       mode: settings.bandwidthProfileMode,
        //       renderDimensions: {
        //         low: getResolution(settings.renderDimensionLow),
        //         standard: getResolution(settings.renderDimensionStandard),
        //         high: getResolution(settings.renderDimensionHigh),
        //       }
        //     },
        //   },
        // }
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
  getIfIsReelOwner(){
    return this.meetingService.getIfIsReelOwner(this.event);
  }

  /**
   * Function call when event localPreview is done and past to the observable localPreviewTracks$
   * @param localTrack : Array of tracks - all tracks of the local (audio or/and video)
   */
  localPreviewDone(localTrack){
    this.$localPreviewTracksDataSource.next(localTrack);
  }

  /**
   * Function call when event connectedToRoomTwilio
   * @param room: Room (object twilio)
   * @param localMeetingParticipant: IParticipantMeeting
   */
  connectedToRoomTwilio({room, localMeetingParticipant}){
    this.addParticipantFromParticipantConnectedArr(localMeetingParticipant);
    this.$localParticipantConnectedDataSource.next(room.localParticipant);
    this.cd.detectChanges();
  }

  /**
   * Function call when participant conncted to the room
   * @param participant: IParticipantMeeting (object twilio)
   */
  participantConnected(participant: IParticipantMeeting){
    this.addParticipantFromParticipantConnectedArr(participant)
  }

  /**
   * Function call when participant disconnected to the room
   * @param participant: IParticipantMeeting (object twilio)
   */
  participantDisconnected(participant: IParticipantMeeting){
    this.removeParticipantDominantSpeaker(participant);
    this.removeParticipantFromParticipantConnectedArr(participant);
  }

  /**
   * Function call when local participant leave the room
   */
  disconnected(){
    this.deactiveLocalTracks();
    this.meetingService.disconnected();
  }

  /**
   * function to remove a specific participant to the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to remove
   * @private
   */
  private removeParticipantFromParticipantConnectedArr(participant: IParticipantMeeting) {
    const roomArr: any[] = this.$participantConnectedDataSource.getValue();

    roomArr.forEach((item, index) => {
      if (item.identity === participant.identity) { roomArr.splice(index, 1); }
    });

    this.$participantConnectedDataSource.next(roomArr);
  }

  /**
   * function to add a specific participant to the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to add
   * @private
   */
  private addParticipantFromParticipantConnectedArr(participant: IParticipantMeeting) {
    const currentValue = this.$participantConnectedDataSource.getValue();
    currentValue.forEach((item) => {
      if (item.identity === participant.identity) {
        // Participant already in room
        return;
      }
    });
    // const updatedValue = [...currentValue, participant];
    currentValue.push(participant);
    this.$participantConnectedDataSource.next(currentValue);
    // this.setParticipantDominantSpeaker(participant)
  }

  /**
   *
   */
  dominantSpeakerChanged(participant: IParticipantMeeting){
    // this.setParticipantDominantSpeaker(participant);

  }

  setParticipantDominantSpeaker(participant: IParticipantMeeting){
    const allParticipantAlreadyInTheRoom = this.$participantConnectedDataSource.getValue();

    const identityOfOwner = this.event.organizedBy.uid;

    const newParticipantDominantSpeaker = allParticipantAlreadyInTheRoom.find(tt => tt.identity === identityOfOwner)
    if(!!newParticipantDominantSpeaker){
      newParticipantDominantSpeaker.isDominantSpeaker = true;
      this.$dominantParticipantForBuyerDataSource.next(newParticipantDominantSpeaker);
    } else {
      this.$dominantParticipantForBuyerDataSource.next(null);
    }
    // }
  }


  removeParticipantDominantSpeaker(participant: IParticipantMeeting){
    if(!participant){
      //Participant is required
      return;
    }
    const allParticipantAlreadyInTheRoom = this.$participantConnectedDataSource.getValue();
    const participantWasDominantSpeaker = this.$dominantParticipantForBuyerDataSource.getValue();
    const identityOfOwner = this.event.organizedBy.uid;

    const newParticipantDominantSpeaker = allParticipantAlreadyInTheRoom.find(tt => tt.identity === identityOfOwner)
    if(!!participantWasDominantSpeaker){
      if(participant.identity === participantWasDominantSpeaker.identity){
        newParticipantDominantSpeaker.isDominantSpeaker = false;
        this.$dominantParticipantForBuyerDataSource.next(null);
        // this.$participantConnectedDataSource.next(allParticipantAlreadyInTheRoom);
      }
    }
    // }
  }


  gg(){
    return this.$dominantParticipantForBuyerDataSource.getValue();
  }

  /**
   *
   * @param participant
   */
  eventParticipantDisconnected(participant: IParticipantMeeting){
    this.removeParticipantFromParticipantConnectedArr(participant);
    this.disconnected();
  }



  noParticipantConnected(){
    return this.$participantConnectedDataSource.getValue().length < 1
  }

  numOfCols(){
    const lengththisParticipantConnected = this.$participantConnectedDataSource.getValue().length;
    return (lengththisParticipantConnected < 2) ? 1 : (lengththisParticipantConnected > 4) ? 3 : 2
  }

  /**
   *
   */
  deactiveLocalTracks() {
    const localParticipant = this.meetingService.getLocalParticipant();
    if(!!!localParticipant){
      return ;
    }
    localParticipant.audioTracks.forEach((publication) => {
      publication.track.stop()
      publication.track.disable()
    })
    localParticipant.videoTracks.forEach((publication) => {
      publication.track.stop()
      publication.track.disable()
    })
  }

  setUpLocalVideoAndAudio({kind, boolToChange}){
    this.meetingService.setUpLocalVideoAndAudio(kind, boolToChange)
  }

  ngOnDestroy() {
    this.disconnected()
  }
}
