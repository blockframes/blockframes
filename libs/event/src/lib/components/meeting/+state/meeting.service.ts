import { Injectable } from '@angular/core';

//Import Twilio-video
import * as Video from 'twilio-video';
import {BehaviorSubject} from "rxjs";
import {InvitationQuery} from "@blockframes/invitation/+state";
import {User, UserQuery, UserService} from "@blockframes/user/+state";

export enum meetingEventEnum {
  ParticipantConnected= 'participantConnected',
  ParticipantDisconnected= 'participantDisconnected',
  TrackSubscribed= 'trackSubscribed',
  TrackUnsubscribed= 'trackUnsubscribed',
  Disconnected= 'disconnected',
  ConnectedToRoomTwilio= 'connectedToRoomTwilio',
}

export interface EventRoom {
  meetingEvent: meetingEventEnum,
  data: any
}


@Injectable({
  providedIn: 'root'
})
export class MeetingService {


  private eventRoom = new BehaviorSubject<any>({});

  activeRoom;

  previewTracks;

  camDeactivate = false;
  micDeactivate = false;

  constructor(private userService: UserService) {}


  getEventRoom(){
    return this.eventRoom;
  }

  /**
   * Create LocalParticipant's Tracks and send it Twilio;
   */
  createLocalPreview() {
    //get local track if here or recreate local track for twilio
    const localTracksPromise = this.previewTracks
      ? Promise.resolve(this.previewTracks)
      : Video.createLocalTracks();

    localTracksPromise.then(
      (tracks) => {
        this.previewTracks = tracks;
      },
      () => {
        this.camDeactivate = true;
        this.micDeactivate = true;
      }
    );
  }

  /**
   * Connection to twilio with the access token and option of connection
   * @param accessToken - string - access Token for twilio
   * @param options - object - option of connection for twilio
   * @param roomName - string - Nome of the room
   * @param identity - name/id of user want to connect
   */
  connectToTwilioRoom(accessToken: string, options, roomName) {

    this.createLocalPreview()

    const connectOptions = options;
    if (this.previewTracks) {
      connectOptions.tracks = this.previewTracks;
    }

    Video.connect(accessToken, connectOptions).then((r) => this.roomJoined(r), (error) => {
      console.log('Could not connect to Twilio: ' + error.message);
    });
  }

  /**
   * When successfully connected to room.
   * @param room - room twilio where we are connected
   */
  roomJoined(room) {
    //save activeRoom
    this.activeRoom = room;

    const identity = room.localParticipant.identity;

    this.userService.getUser(identity)
      .then((user: User) => {

        // console.log("Joined as '" + this.identity + "'");
        room.localParticipant.firstName = user.firstName
        room.localParticipant.lastName = user.lastName
        this.eventRoom.next({
          meetingEvent: meetingEventEnum.ConnectedToRoomTwilio,
          data: room
        });

        this.setUpRoomEvent(room);
      })
      .catch(error => {
        console.log('get user by uid on error : ', error)
      })
      .finally(() => {
        console.log('get user by uid on finally : ')
      })

  }

  /**
   * SetUp all event of the Room went we are connected
   * @param room - Room connected
   */
  setUpRoomEvent(room){
    console.log('setUpRoomEvent : ', {room})

    // When a Participant joins the Room, log the event.
    room.on(meetingEventEnum.ParticipantConnected, (participant) => {
      console.log("Joining: '" + participant.identity + "'");


      this.userService.getUser(participant.identity)
        .then((user: User) => {

          // console.log("Joined as '" + this.identity + "'");
          participant.firstName = user.firstName
          participant.lastName = user.lastName

          this.eventRoom.next({
            meetingEvent: meetingEventEnum.ParticipantConnected,
            data: participant
          });
        })
        .catch(error => {
          console.log('get user by uid on error : ', error)
        })
        .finally(() => {
          console.log('get user by uid on finally : ')
        })
    });

    // When a Participant adds a Track, attach it to the DOM.
    room.on(meetingEventEnum.TrackSubscribed, (track, trackPublication, participant) => {
      // this.attachTracks([track], participantContainer, 'participantContainer');

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.TrackSubscribed,
        data: {track, trackPublication, participant}
      });
    });

    // When a Participant removes a Track, detach it from the DOM.
    room.on(meetingEventEnum.TrackUnsubscribed, (track, trackPublication, participant) => {

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.TrackUnsubscribed,
        data: {track, trackPublication, participant}
      });
      // this.detachTracks([track]);
    });

    // When a Participant leaves the Room, detach its Tracks.
    room.on(meetingEventEnum.ParticipantDisconnected, (participant) => {

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.ParticipantDisconnected,
        data: participant
      });
    });

    // Once the LocalParticipant leaves the room, detach the Tracks
    // of all Participants, including that of the LocalParticipant.
    room.on(meetingEventEnum.Disconnected, (s) => {

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.Disconnected,
        data: s
      });
      console.log('Left');

      // if (this.previewTracks) {
      //   this.previewTracks.forEach((track) => {
      //     track.stop();
      //   });
      // }
      // this.detachParticipantTracks(room.localParticipant);
      // this.activeRoom = null;
    });
  }


}
