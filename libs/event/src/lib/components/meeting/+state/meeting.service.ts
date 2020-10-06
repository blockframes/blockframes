import {Injectable} from '@angular/core';

//Import Twilio-video
import * as Video from 'twilio-video';
import {Participant, RemoteAudioTrack, RemoteTrackPublication, RemoteVideoTrack, Room} from 'twilio-video';
import {BehaviorSubject, Observable} from "rxjs";
import {User, UserService} from "@blockframes/user/+state";
import {Event} from "@blockframes/event/+state";
import {AuthQuery} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";


export enum meetingEventEnum {
  ParticipantConnected = 'participantConnected',
  ParticipantDisconnected = 'participantDisconnected',
  TrackSubscribed = 'trackSubscribed',
  TrackUnsubscribed = 'trackUnsubscribed',
  Disconnected = 'disconnected',
  ConnectedToRoomTwilio = 'connectedToRoomTwilio',
  LocalPreviewDone = 'localPreviewDone',
  TrackDisabled = 'trackDisabled',
  DominantSpeakerChanged = 'dominantSpeakerChanged',
}

export interface EventRoom {
  meetingEvent: meetingEventEnum,
  data: any
}


export interface StatusVideoMic {
  video: boolean,
  audio: boolean
}


@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  private eventRoom = new BehaviorSubject<EventRoom>({
    meetingEvent: null,
    data: null
  });


  protected $localVideoMicStatusDataSource: BehaviorSubject<StatusVideoMic> = new BehaviorSubject({
    video: false,
    audio: false
  });
  public localVideoMicStatus$: Observable<StatusVideoMic> = this.$localVideoMicStatusDataSource.asObservable();

  activeRoom;

  previewTracks;

  localParticipant;

  camDeactivate = false;
  micDeactivate = false;

  constructor(
    private userService: UserService,
    private query: AuthQuery
  ) {

  }

  getEventRoom() {
    return this.eventRoom;
  }

  getCamDeactivate() {
    return this.camDeactivate;
  }

  getMicDeactivate() {
    return this.micDeactivate;
  }

  getLocalParticipant() {
    return this.localParticipant;
  }

  /**
   *
   */
  getLocalVideoMicStatus(): Observable<StatusVideoMic> {
    return this.localVideoMicStatus$;
  }

  getActiveUser() {
    return this.query.user;
  }

  getIfIsReelOwner(event: Event) {
    return this.query.userId === event.organizedBy.uid;
  }

  getIfAudioIsAvailable() {
    return navigator.mediaDevices.getUserMedia({audio: true})
      .then(value => {
        return true;
      })
      .catch(reason => {
        return false;
      })
  }

  getIfVideoIsAvailable() {
    return navigator.mediaDevices.getUserMedia({video: true})
      .then(value => {
        return true;
      })
      .catch(reason => {
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
  getTracksOfParticipant(participant: Participant) {
    return Array.from(participant.tracks).map((
      track: any
    ) => {
      //participant[0] is the key
      return track[1];
    });
  }

  /**
   * Get all participant already in the room.
   * @param participants - All participants connected in the room
   */
  getParticipantOfParticipantsMapAlreadyInRoom(participants: Participant[]) {
    return Array.from(participants).map((
      participant: any
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
      connectOptions.tracks = this.previewTracks;
      connectOptions.enableDominantSpeaker = true;
    }

    Video.connect(accessToken, connectOptions).then((r: Room) => this.roomJoined(r, event), (error) => {
      console.log('error : ', error)
    });
  }

  /**
   * When successfully connected to room.
   * @param room - room twilio where we are connected
   * @param event - event when we com from / cascade8
   */
  async roomJoined(room: Room, event: Event) {
    //save activeRoom
    this.activeRoom = room;


    const identity = room.localParticipant.identity;

    if (!!room.participants) {
      const tracksOfParticipants = this.getParticipantOfParticipantsMapAlreadyInRoom(room.participants);
      if (!!tracksOfParticipants && tracksOfParticipants.length > 0) {
        for (const indexParticipant in tracksOfParticipants) {
          const remoteMeetingParticipant = await this.createIParticipantMeeting(tracksOfParticipants[indexParticipant]);
          this.eventRoom.next({
            meetingEvent: meetingEventEnum.ParticipantConnected,
            data: remoteMeetingParticipant
          });
        }
      }
    }

    const localMeetingParticipant = await this.createIParticipantMeeting(room.localParticipant, false, true);


    this.eventRoom.next({
      meetingEvent: meetingEventEnum.ConnectedToRoomTwilio,
      data: {room, localMeetingParticipant}
    });
    this.localParticipant = localMeetingParticipant;

    this.eventRoom.next({
      meetingEvent: meetingEventEnum.DominantSpeakerChanged,
      data: null
    });

    await this.setUpRoomEvent(room);
  }

  private async createIParticipantMeeting(twilioParticipant: Participant, isDominantSpeaker = false, isLocalSpeaker = false){
    const remoteUser = await this.userService.getUser(twilioParticipant.identity)

    return {
      identity: twilioParticipant.identity,
      twilioData : twilioParticipant,
      festivalData: {
        firstName: remoteUser.firstName,
        lastName: remoteUser.lastName,
        avatar: remoteUser.avatar,
        organizationName: 'To Be Implemented',
      },
      isDominantSpeaker: isDominantSpeaker,
      isLocalSpeaker: isLocalSpeaker,
    } as IParticipantMeeting;
  }

  /**
   * SetUp all event of the Room went we are connected
   * @param room - Room connected
   */
  setUpRoomEvent(room: Room) {

    // When a Participant joins the Room, log the event.
    room.on(meetingEventEnum.ParticipantConnected,
      async (participant: Participant) => {

      const meetingParticipant = await this.createIParticipantMeeting(participant);

        this.eventRoom.next({
          meetingEvent: meetingEventEnum.ParticipantConnected,
          data: meetingParticipant
        });
      });

    // When a Participant adds a Track, attach it to the DOM.
    room.on(meetingEventEnum.TrackSubscribed, (track: RemoteVideoTrack | RemoteAudioTrack, trackPublication: RemoteTrackPublication, participant: Participant) => {
      // this.attachTracks([track], participantContainer, 'participantContainer');

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.TrackSubscribed,
        data: {track, trackPublication, participant}
      });
    });

    // When a Participant removes a Track, detach it from the DOM.
    room.on(meetingEventEnum.TrackUnsubscribed, (track: RemoteVideoTrack | RemoteAudioTrack, trackPublication: RemoteTrackPublication, participant: Participant) => {

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.TrackUnsubscribed,
        data: {track, trackPublication, participant}
      });
      // this.detachTracks([track]);
    });

    // When a Participant leaves the Room, detach its Tracks.
    room.on(meetingEventEnum.ParticipantDisconnected, (participant: Participant) => {

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.ParticipantDisconnected,
        data: participant
      });
    });

    // To catch the dominant speaker change
    // room.on(meetingEventEnum.DominantSpeakerChanged, (participant: Participant) => {
    //
    //   this.eventRoom.next({
    //     meetingEvent: meetingEventEnum.DominantSpeakerChanged,
    //     data: participant
    //   });
    // });

    // Once the LocalParticipant leaves the room, detach the Tracks
    // of all Participants, including that of the LocalParticipant.
    room.on(meetingEventEnum.Disconnected, () => {

      this.eventRoom.next({
        meetingEvent: meetingEventEnum.Disconnected,
        data: null
      });

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
   * Mute/unmute your local media.
   * @param kind - The type of media you want to mute/unmute
   * @param mute - bool - mute/unmute
   */
  muteOrUnmuteYourLocalMediaPreview(kind: string, mute: boolean) {
    //get local track
    const localTrack = this.getTracksOfParticipant(this.localParticipant);
    this.setUpLocalVideoAndAudio(kind, mute);

    let track: any = [];
    //get audio or video track
    if (kind === localTrack[0].kind) {
      track = localTrack[0].track
    } else {
      track = localTrack[1].track
    }

    if (mute) {
      track.stop();
      track.disable();
    } else {
      track.restart();
      track.enable();
    }
  }


  /**
   *
   * @param kind
   * @param boolToChange
   */
  setUpLocalVideoAndAudio(kind: string, boolToChange: boolean) {
    if (kind === 'video') {
      this.$localVideoMicStatusDataSource.next({
        ...this.$localVideoMicStatusDataSource.getValue(),
        video: boolToChange
      });
    } else {
      this.$localVideoMicStatusDataSource.next({
        ...this.$localVideoMicStatusDataSource.getValue(),
        audio: boolToChange
      });
    }
    // this.cd.detectChanges();
  }


  /**
   *v For disconnect from twilio Room
   */
  disconnected() {
    if (!!this.activeRoom) {
      this.activeRoom.disconnect()
    }
  }


}
