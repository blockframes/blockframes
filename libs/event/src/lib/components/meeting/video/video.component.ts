//Angular
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

//Blockframes
import {Event, EventService} from "@blockframes/event/+state";
import {ErrorResultResponse} from "@blockframes/utils/utils";
import {
  EventRoom,
  meetingEventEnum,
  MeetingService
} from "@blockframes/event/components/meeting/+state/meeting.service";

import {BehaviorSubject, Observable} from "rxjs";
import { Participant as IParticipantMeeting } from 'twilio-video';

@Component({
  selector: 'event-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoComponent implements OnInit, AfterViewInit, OnDestroy {

  //Input event meeting
  @Input() event: Event;

  accessToken: string = null;

  //Array of participant connected to the room
  private $participantConnectedDataSource: BehaviorSubject<IParticipantMeeting[]> = new BehaviorSubject([]);
  arrayOfParticipantConnected$: Observable<IParticipantMeeting[]> = this.$participantConnectedDataSource.asObservable();

  //Participant local in the room
  private $localParticipantConnectedDataSource: BehaviorSubject<IParticipantMeeting> = new BehaviorSubject(null);
  localParticipantConnected$: Observable<IParticipantMeeting> = this.$localParticipantConnectedDataSource.asObservable();

  //Dominant Participant for Buyer
  private $dominantParticipantForBuyerDataSource: BehaviorSubject<IParticipantMeeting> = new BehaviorSubject(null);
  dominantParticipantForBuyer$: Observable<IParticipantMeeting> = this.$dominantParticipantForBuyerDataSource.asObservable();
  tt = 1;

  private $localPreviewTracksDataSource: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  localPreviewTracks$: Observable<any> = this.$localPreviewTracksDataSource.asObservable();

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

    const img = document.querySelector("#contener-event-meeting");
    const width = img.clientWidth;
    const height = img.clientHeight;

  }

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
   */
  connectedToRoomTwilio(room){
    this.$localParticipantConnectedDataSource.next(room.localParticipant);
    this.cd.detectChanges();
  }

  /**
   * Function call when participant conncted to the room
   * @param participant: Participant (object twilio)
   */
  participantConnected(participant: IParticipantMeeting){
    this.addParticipantFromParticipantConnectedArr(participant)
  }

  /**
   * Function call when participant disconnected to the room
   * @param participant: Participant (object twilio)
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
   * @param participant: Participant (object twilio) : Participant to remove
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
   * @param participant: Participant (object twilio) : Participant to add
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
    this.setParticipantDominantSpeaker(participant)
  }

  /**
   *
   */
  dominantSpeakerChanged(participant: IParticipantMeeting){
    this.setParticipantDominantSpeaker(participant);

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
  eventParticipantDeconected(participant: IParticipantMeeting){
    this.removeParticipantFromParticipantConnectedArr(participant);
    this.disconnected();
  }

  /**
   *
   * @param index
   * @param item
   */
  identify(index, item) {
    return item.identity;
  }


  noParticipantConnecte(){
    return this.$participantConnectedDataSource.getValue().length < 1
  }

  numOfCols(){
    const lengththisParticipantConnected = this.$participantConnectedDataSource.getValue().length;
    return (lengththisParticipantConnected < 2) ? 1 : (lengththisParticipantConnected > 4) ? 3 : 2
  }

  getIfLocalIsAlone(){
    return this.$participantConnectedDataSource.getValue().length < 1;
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

  ngOnDestroy() {
    this.disconnected()
  }
}
