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
import {take} from "rxjs/operators";

@Component({
  selector: 'event-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

  @Input() event: Event;

  accessToken: string = null;

  private $participantConnectedDataSource: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  arrayOfParticipantConnected$: Observable<any> = this.$participantConnectedDataSource.asObservable();

  private $localParticipantConnectedDataSource: BehaviorSubject<any> = new BehaviorSubject(null);
  localParticipantConnected$: Observable<any> = this.$localParticipantConnectedDataSource.asObservable();

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
          this.disconnected(value.data);
          break;
        case meetingEventEnum.ConnectedToRoomTwilio:
          this.connectedToRoomTwilio(value.data);
          break;
      }
    })
  }

  ngOnInit(): void {
    console.log('before ngOnInit this.event : ', this.event)
    this.eventService.getTwilioAccessToken(this.event.id).then((value: ErrorResultResponse) => {
      console.log('value : ', value)
      if(value.error !== ''){
        console.log('token NOK : ', value)
      } else {
        this.accessToken = value.result;
        this.meetingService.connectToTwilioRoom(this.accessToken, { name: this.event.id, audio: true}, this.event.id);
        console.log('token OK : ')
      }
    })
  }

  connectedToRoomTwilio(room){
    console.log('---------------------------connectedToRoomTwilio---------------------------');
    // this.localParticipant = room.localParticipant;
    this.$localParticipantConnectedDataSource.next(room.localParticipant);
  }

  participantConnected(participant){
    console.log('---------------------------participantConnected---------------------------')
    this.addParticipantFromParticipantConnectedArr(participant)
  }

  participantDisconnected(participant){
    console.log('---------------------------participantDisconnected---------------------------')
    this.removeParticipantFromParticipantConnectedArr(participant);
  }

  trackSubscribed(participant){
    console.log('---------------------------trackSubscribed---------------------------')
  }

  trackUnsubscribed(participant){
    console.log('---------------------------trackUnsubscribed---------------------------')
  }

  disconnected(participant){
    console.log('---------------------------disconnected---------------------------')
  }

  private removeParticipantFromParticipantConnectedArr(participant: any) {
    const roomArr: any[] = this.$participantConnectedDataSource.getValue();

    roomArr.forEach((item, index) => {
      if (item.identity === participant.identity) { roomArr.splice(index, 1); }
    });

    this.$participantConnectedDataSource.next(roomArr);
  }

  private addParticipantFromParticipantConnectedArr(participant: any) {
    const currentValue = this.$participantConnectedDataSource.value;
    currentValue.forEach((item, index) => {
      if (item.identity === participant.identity) {
        // Participant already in room
        return;
      }
    });
    const updatedValue = [...currentValue, participant];
    this.$participantConnectedDataSource.next(updatedValue);
  }
}
