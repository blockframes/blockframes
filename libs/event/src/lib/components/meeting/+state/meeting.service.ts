import {Injectable} from '@angular/core';

//Import Twilio-video
import * as Video from 'twilio-video';
import {BehaviorSubject} from "rxjs";
import {User, UserService} from "@blockframes/user/+state";

export enum meetingEventEnum {
  ParticipantConnected= 'participantConnected',
  ParticipantDisconnected= 'participantDisconnected',
  TrackSubscribed= 'trackSubscribed',
  TrackUnsubscribed= 'trackUnsubscribed',
  Disconnected= 'disconnected',
  ConnectedToRoomTwilio= 'connectedToRoomTwilio',
  LocalPreviewDone = 'localPreviewDone',
  TrackDisabled = 'trackDisabled',
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

  localParticipant;

  camDeactivate = false;
  micDeactivate = false;

  constructor(private userService: UserService) {

  }


  getEventRoom(){
    return this.eventRoom;
  }

  getCamDeactivate(){
    return this.camDeactivate;
  }

  getMicDeactivate(){
    return this.micDeactivate;
  }

  getLocalParticipant(){
    return this.localParticipant;
  }

  setLocalTrackToRoom(){

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
        this.eventRoom.next({
          meetingEvent: meetingEventEnum.LocalPreviewDone,
          data: tracks
        });
      },
      () => {
        this.camDeactivate = true;
        this.micDeactivate = true;
      }
    );
  }



  /**
   * Get all participant already in the room.
   * @param participant - All participants connected in the room
   */
  getTracksOfParticipant(participant) {
    return Array.from(participant.tracks).map((
      track : any
    ) => {
      console.log('getTracksOfParticipant track : ', track)
      //participant[0] is the key
      return track[1];
    });
  }

  /**
   * Get all participant already in the room.
   * @param participants - All participants connected in the room
   */
  getParticipantOfParticipantsMapAlreadyInRoom(participants) {
    return Array.from(participants).map((
      participant : any
    ) => {
      //participant[0] is the key
      return participant[1];
    });
  }

  /**
   * Connection to twilio with the access token and option of connection
   * @param accessToken - string - access Token for twilio
   * @param options - object - option of connection for twilio
   * @param roomName - string - Nome of the room
   */
  connectToTwilioRoom(accessToken: string, options, roomName) {

    const connectOptions = options;
    if (this.previewTracks) {
      console.log('Has Preview')
      connectOptions.tracks = this.previewTracks;
    }

    Video.connect(accessToken, connectOptions).then((r) => this.roomJoined(r), (error) => {
      console.log('Could not connect to Twilio: ' + error.message);
    });
  }


  async getFirstNameAndLastNameOfParticipant(participant){
    const localUser: User = await this.userService.getUser(participant.identity)
    participant.firstName = localUser.firstName
    participant.lastName = localUser.lastName
    return participant;
  }

  /**
   * When successfully connected to room.
   * @param room - room twilio where we are connected
   */
  async roomJoined(room) {
    //save activeRoom
    this.activeRoom = room;


    const identity = room.localParticipant.identity;

    if(!!room.participants) {
      const tracksOfParticipants = this.getParticipantOfParticipantsMapAlreadyInRoom(room.participants);
      console.log('tracksOfParticipants  ', tracksOfParticipants)
      if(!!tracksOfParticipants && tracksOfParticipants.length > 0) {
        for (const indexParticipant in tracksOfParticipants) {
          await this.getFirstNameAndLastNameOfParticipant(tracksOfParticipants[indexParticipant])
          this.eventRoom.next({
            meetingEvent: meetingEventEnum.ParticipantConnected,
            data: tracksOfParticipants[indexParticipant]
          });
        }
      }
    }

    const localUser: User = await this.userService.getUser(identity)

    // console.log("Joined as '" + this.identity + "'");
    room.localParticipant.firstName = localUser.firstName
    room.localParticipant.lastName = localUser.lastName
    this.eventRoom.next({
      meetingEvent: meetingEventEnum.ConnectedToRoomTwilio,
      data: room
    });
    this.localParticipant = room.localParticipant;

    await this.setUpRoomEvent(room);

  }

  /**
   * SetUp all event of the Room went we are connected
   * @param room - Room connected
   */
  setUpRoomEvent(room){
    console.log('setUpRoomEvent : ', {room})

    // When a Participant joins the Room, log the event.
    room.on(meetingEventEnum.ParticipantConnected, async (participant) => {
      console.log("Joining: '" + participant.identity + "'");


      const remoteUser = await this.userService.getUser(participant.identity)

      participant.firstName = remoteUser.firstName
      participant.lastName = remoteUser.lastName

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.ParticipantConnected,
        data: participant
      });
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

  /**
   *
   */
  disconnected(){
    this.activeRoom.disconnect()
  }


}
