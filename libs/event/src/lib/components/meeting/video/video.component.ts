//Angular
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';

//Blockframes
import {Event, EventService} from "@blockframes/event/+state";
import {ErrorResultResponse} from "@blockframes/utils/utils";
import {
  EventRoom,
  meetingEventEnum,
  MeetingService
} from "@blockframes/event/components/meeting/+state/meeting.service";

import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'event-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoComponent implements OnInit, OnDestroy {

  //Input event meeting
  @Input() event: Event;
  @Input() isOwner: Boolean;

  accessToken: string = null;

  //Array of participant connected to the room
  private $participantConnectedDataSource: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  arrayOfParticipantConnected$: Observable<any> = this.$participantConnectedDataSource.asObservable();

  //Participant local in the room
  private $localParticipantConnectedDataSource: BehaviorSubject<any> = new BehaviorSubject(null);
  localParticipantConnected$: Observable<any> = this.$localParticipantConnectedDataSource.asObservable();


  private $localPreviewTracksDataSource: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  localPreviewTracks$: Observable<any> = this.$localPreviewTracksDataSource.asObservable();

  constructor(private eventService: EventService,
              private meetingService: MeetingService) {


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
      }
    })
  }

  async ngOnInit() {

    const audio = await this.meetingService.getIfAudioIsAvailable();
    const video = await this.meetingService.getIfVideoIsAvailable();
    await this.meetingService.createLocalPreview();

    this.eventService.getTwilioAccessToken(this.event.id).then((value: ErrorResultResponse) => {
      if(value.error !== ''){
      } else {
        this.accessToken = value.result;
        this.meetingService.connectToTwilioRoom(this.accessToken, { name: this.event.id, audio, video}, this.event.id);
      }
    })
  }

  /**
   * Function call when event localPreview is done and past to the observable localPreviewTracks$
   * @param localTrack : Array of tracks - all tracks of the local (audio or/and video)
   */
  localPreviewDone(localTrack){
    console.log('---------------------------localPreviewDone---------------------------');
    this.$localPreviewTracksDataSource.next(localTrack);
  }

  /**
   * Function call when event connectedToRoomTwilio
   * @param room: Room (object twilio)
   */
  connectedToRoomTwilio(room){
    console.log('---------------------------connectedToRoomTwilio---------------------------');
    this.$localParticipantConnectedDataSource.next(room.localParticipant);
  }

  /**
   * Function call when participant conncted to the room
   * @param participant: Participant (object twilio)
   */
  participantConnected(participant){
    console.log('---------------------------participantConnected---------------------------')
    this.addParticipantFromParticipantConnectedArr(participant)
  }

  /**
   * Function call when participant disconnected to the room
   * @param participant: Participant (object twilio)
   */
  participantDisconnected(participant){
    console.log('---------------------------participantDisconnected---------------------------')
    this.removeParticipantFromParticipantConnectedArr(participant);
  }

  /**
   * Function call when local participant leave the room
   */
  disconnected(){
    console.log('---------------------------disconnected---------------------------')
    this.deactiveLocalTracks();
    this.meetingService.disconnected();
  }

  /**
   * function to remove a specific participant to the array of participant connected (participantConnected$)
   * @param participant: Participant (object twilio) : Participant to remove
   * @private
   */
  private removeParticipantFromParticipantConnectedArr(participant: any) {
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
  private addParticipantFromParticipantConnectedArr(participant: any) {
    const currentValue = this.$participantConnectedDataSource.getValue();
    currentValue.forEach((item) => {
      if (item.identity === participant.identity) {
        // Participant already in room
        return;
      }
    });
    const updatedValue = [...currentValue, participant];
    this.$participantConnectedDataSource.next(updatedValue);
  }


  /**
   *
   * @param participant
   */
  eventParticipantDeconected(participant){
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

  numOfCols(){
    const lengththisParticipantConnected = this.$participantConnectedDataSource.getValue().length;
    return (lengththisParticipantConnected < 2) ? 1 : (lengththisParticipantConnected > 4) ? 3 : 2
  }

  getIfLocalIsAlone(){
    return this.$participantConnectedDataSource.getValue().length < 0;
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
