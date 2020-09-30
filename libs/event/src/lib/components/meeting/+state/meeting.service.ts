import {Injectable} from '@angular/core';

//Import Twilio-video
import * as Video from 'twilio-video';
import {BehaviorSubject} from "rxjs";
import {OrganizationMember, User, UserQuery, UserService} from "@blockframes/user/+state";
import {Event} from "@blockframes/event/+state";
import { Participant as IIParticipantMeeting } from 'twilio-video';


export enum meetingEventEnum {
  ParticipantConnected= 'participantConnected',
  ParticipantDisconnected= 'participantDisconnected',
  TrackSubscribed= 'trackSubscribed',
  TrackUnsubscribed= 'trackUnsubscribed',
  Disconnected= 'disconnected',
  ConnectedToRoomTwilio= 'connectedToRoomTwilio',
  LocalPreviewDone = 'localPreviewDone',
  TrackDisabled = 'trackDisabled',
  DominantSpeakerChanged = 'dominantSpeakerChanged',
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

  constructor(
    private userService: UserService,
    private userQuery: UserQuery,
    ) {

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

  getIfIsReelOwner(event){
    const userIdActive = this.userQuery.getActiveId();
    return userIdActive === event.organizedBy.uid;
  }

  getIfAudioIsAvailable(){
    return navigator.mediaDevices.getUserMedia({ audio: true})
      .then(value => {
        return true;
      })
      .catch(reason => {
        return false;
      })
  }

  getIfVideoIsAvailable(){
    return navigator.mediaDevices.getUserMedia({ video: true})
    .then(value => {
      return true;
    })
    .catch(reason => {
      console.log('reason : ', reason)
      return false;
    })
  }

  /**
   * Create LocalParticipant's Tracks and send it Twilio;
   */
  async createLocalPreview() {

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

      }
    );
  }



  /**
   * Get track of one participant
   * @param participant - All participants connected in the room
   */
  getTracksOfParticipant(participant: IIParticipantMeeting) {
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
  getParticipantOfParticipantsMapAlreadyInRoom(participants: IIParticipantMeeting[]) {
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
   * @param event - string - All event we come from
   */
  connectToTwilioRoom(accessToken: string, options, event: Event) {

    const connectOptions = options;
    if (this.previewTracks) {
      console.log('Has Preview')
      connectOptions.tracks = this.previewTracks;
      connectOptions.enableDominantSpeaker = true;
    }

    Video.connect(accessToken, connectOptions).then((r) => this.roomJoined(r, event), (error) => {
      console.log('Could not connect to Twilio: ' + error.message);
    });
  }


  async getFirstNameAndLastNameOfParticipant(participant: IIParticipantMeeting){
    const localUser: User = await this.userService.getUser(participant.identity)
    participant.firstName = localUser.firstName
    participant.lastName = localUser.lastName
    return participant;
  }

  /**
   * When successfully connected to room.
   * @param room - room twilio where we are connected
   * @param event - event when we com from / cascade8
   */
  async roomJoined(room, event) {
    //save activeRoom
    this.activeRoom = room;

    console.log('room : ', room)

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
    room.localParticipant.isDominantSpeaker = false
    this.eventRoom.next({
      meetingEvent: meetingEventEnum.ConnectedToRoomTwilio,
      data: room
    });
    this.localParticipant = room.localParticipant;

    this.eventRoom.next({
      meetingEvent: meetingEventEnum.DominantSpeakerChanged,
      data: null
    });

    await this.setUpRoomEvent(room);

  }

  /**
   * SetUp all event of the Room went we are connected
   * @param room - Room connected
   */
  setUpRoomEvent(room){
    console.log('setUpRoomEvent : ', {room})

    // When a Participant joins the Room, log the event.
    room.on(meetingEventEnum.ParticipantConnected, async (participant: IIParticipantMeeting) => {
      console.log("Joining: '" + participant.identity + "'");


      const remoteUser = await this.userService.getUser(participant.identity)

      participant.firstName = remoteUser.firstName
      participant.lastName = remoteUser.lastName
      participant.isDominantSpeaker = false;

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.ParticipantConnected,
        data: participant
      });
    });

    // When a Participant adds a Track, attach it to the DOM.
    room.on(meetingEventEnum.TrackSubscribed, (track, trackPublication, participant: IIParticipantMeeting) => {
      // this.attachTracks([track], participantContainer, 'participantContainer');

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.TrackSubscribed,
        data: {track, trackPublication, participant}
      });
    });

    // When a Participant removes a Track, detach it from the DOM.
    room.on(meetingEventEnum.TrackUnsubscribed, (track, trackPublication, participant: IIParticipantMeeting) => {

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.TrackUnsubscribed,
        data: {track, trackPublication, participant}
      });
      // this.detachTracks([track]);
    });

    // When a Participant leaves the Room, detach its Tracks.
    room.on(meetingEventEnum.ParticipantDisconnected, (participant: IIParticipantMeeting) => {

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.ParticipantDisconnected,
        data: participant
      });
    });

    // To catch the dominant speaker change
    // room.on(meetingEventEnum.DominantSpeakerChanged, (participant: IIParticipantMeeting) => {
    //
    //   this.eventRoom.next({
    //     meetingEvent: meetingEventEnum.DominantSpeakerChanged,
    //     data: participant
    //   });
    // });

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
   *v For disconnect from twilio Room
   */
  disconnected(){
    if(!!this.activeRoom){
      this.activeRoom.disconnect()
    }
  }


}
