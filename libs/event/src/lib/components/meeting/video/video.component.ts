import {Component, Input, OnInit} from '@angular/core';
import {AngularFireFunctions} from "@angular/fire/functions";
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
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  @Input() event: Event;

  accessToken: string = null;

  private $participantConnectedDataSource: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  arrayOfParticipantConnected$: Observable<any> = this.$participantConnectedDataSource.asObservable();

  private $localParticipantConnectedDataSource: BehaviorSubject<any> = new BehaviorSubject(null);
  localParticipantConnected$: Observable<any> = this.$localParticipantConnectedDataSource.asObservable();

  private $localPreviewTracksDataSource: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  localPreviewTracks$: Observable<any> = this.$localPreviewTracksDataSource.asObservable();

  arrayOfParticipantConnected = []

  localParticipant = null;

  constructor(private functions: AngularFireFunctions,
              private eventService: EventService,
              private meetingService: MeetingService) {


    this.meetingService.getEventRoom().subscribe((value: EventRoom) => {
      switch (value.meetingEvent){
        case meetingEventEnum.ParticipantConnected:
          this.participantConnected(value.data);
          break;
        case meetingEventEnum.ParticipantDisconnected:
          this.participantDisconnected(value.data);
          break;
        case meetingEventEnum.TrackSubscribed:
          this.trackSubscribed(value.data);
          break;
        case meetingEventEnum.TrackUnsubscribed:
          this.trackUnsubscribed(value.data);
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

  ngOnInit(): void {

    this.meetingService.createLocalPreview();
    this.eventService.getTwilioAccessToken(this.event.id).then((value: ErrorResultResponse) => {
      if(value.error !== ''){
      } else {
        this.accessToken = value.result;
        this.meetingService.connectToTwilioRoom(this.accessToken, { name: this.event.id, audio: true}, this.event.id);
      }
    })
  }

  /**
   *
   * @param localTrack
   */
  localPreviewDone(localTrack){
    console.log('---------------------------localPreviewDone---------------------------');
    this.$localPreviewTracksDataSource.next(localTrack);
  }

  /**
   *
   * @param room
   */
  connectedToRoomTwilio(room){
    console.log('---------------------------connectedToRoomTwilio---------------------------');
    this.$localParticipantConnectedDataSource.next(room.localParticipant);
  }

  /**
   *
   * @param participant
   */
  participantConnected(participant){
    console.log('---------------------------participantConnected---------------------------')
    this.addParticipantFromParticipantConnectedArr(participant)
  }

  /**
   *
   * @param participant
   */
  participantDisconnected(participant){
    console.log('---------------------------participantDisconnected---------------------------')
    this.removeParticipantFromParticipantConnectedArr(participant);
  }

  /**
   *
   * @param track
   * @param trackPublication
   * @param participant
   */
  trackSubscribed({track, trackPublication, participant}){
    console.log('---------------------------trackSubscribed in video component---------------------------')
    console.log({track, trackPublication, participant})
  }

  /**
   *
   * @param track
   * @param trackPublication
   * @param participant
   */
  trackUnsubscribed({track, trackPublication, participant}){
    console.log('---------------------------trackUnsubscribed in video component---------------------------')
    console.log({track, trackPublication, participant})
  }

  /**
   *
   */
  disconnected(){
    console.log('---------------------------disconnected---------------------------')
    const te = this.$localParticipantConnectedDataSource.getValue();
    console.log('te : ', te)
  }

  /**
   *
   * @param participant
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
   *
   * @param participant
   * @private
   */
  private addParticipantFromParticipantConnectedArr(participant: any) {
    const currentValue = this.$participantConnectedDataSource.value;
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
  }

  /**
   *
   * @param index
   * @param item
   */
  identify(index, item) {
    return item.identity;
  }
}
