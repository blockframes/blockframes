import {Injectable} from '@angular/core';

//Import Twilio-video
import * as Video from 'twilio-video';
import {
  Participant,
  RemoteAudioTrack,
  RemoteTrackPublication,
  RemoteVideoTrack,
  Room,
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteParticipant
} from 'twilio-video';
import {BehaviorSubject, Observable} from "rxjs";
import {User, UserService} from "@blockframes/user/+state";
import {Event} from "@blockframes/event/+state";
import {AuthQuery} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {filter, find, map} from "rxjs/operators";


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

  //Array of participant connected to the room
  private $participantsConnectedDataSource: BehaviorSubject<IParticipantMeeting[]> = new BehaviorSubject([]);

  private $localPreviewTracksDataSource: BehaviorSubject<Array<LocalAudioTrack | LocalVideoTrack>> = new BehaviorSubject([]);

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

  getLocalPreviewTracks(): Observable<Array<LocalAudioTrack | LocalVideoTrack>> {
    return this.$localPreviewTracksDataSource.asObservable();
  }

  getConnectedAllParticipants(): Observable<IParticipantMeeting[]> {
    return this.$participantsConnectedDataSource.asObservable();
  }

  getConnectedRemoteParticipants(): Observable<IParticipantMeeting[]> {
    return this.$participantsConnectedDataSource
      .pipe(
        map(participants => participants.filter(participant => !participant.isLocalSpeaker)
        )
      );
  }

  getConnectedLocalParticipant(): Observable<IParticipantMeeting> {
    return this.$participantsConnectedDataSource
      .pipe(
        map(participants => participants.find(participant => !!participant.isLocalSpeaker)
        )
      );
  }

  getConnectedDominantParticipant(): Observable<IParticipantMeeting> {
    return this.$participantsConnectedDataSource
      .pipe(
        map(participants => participants.find(participant => !!participant.isDominantSpeaker)
        )
      );
  }

  changeConnectedAllParticipants(dataToChange: IParticipantMeeting, isAddParticipant: boolean){
    if(isAddParticipant){
      this.addParticipantToConnectedParticipant(dataToChange)
    } else {
      this.removeParticipantFromConnectedParticipant(dataToChange)
    }
  }

  changeLocalTrack(dataToChange){
    this.$localPreviewTracksDataSource.next(dataToChange)
  }

  changeConnectedDominantParticipant(dataToChange: IParticipantMeeting){

  }

  numbConnectedParticipants(): number {
    return this.$participantsConnectedDataSource.getValue().filter(participant => !!participant.isLocalSpeaker).length
  }

  /**
   * function to remove a specific participant to the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to remove
   */
  removeParticipantFromConnectedParticipant(participant: IParticipantMeeting | Participant) {
    const roomArr: any[] = this.$participantsConnectedDataSource.getValue();

    roomArr.forEach((item, index) => {
      if (item.identity === participant.identity) {
        roomArr.splice(index, 1);
      }
    });
    this.$participantsConnectedDataSource.next(roomArr);
  }

  /**
   * function to add a specific participant to the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to add
   */
  addParticipantToConnectedParticipant(participant: IParticipantMeeting) {
    const currentValue = this.$participantsConnectedDataSource.getValue();
    currentValue.forEach((item) => {
      if (item.identity === participant.identity) {
        // Participant already in room
        return;
      }
    });
    const newCurrentValue = [...currentValue, participant]
    this.$participantsConnectedDataSource.next(newCurrentValue);
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
        this.changeLocalTrack(tracks);
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
  getParticipantOfParticipantsMapAlreadyInRoom(participants: Map<string, RemoteParticipant>) {
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
          const remoteMeetingParticipant = await this.createIParticipantMeeting(tracksOfParticipants[indexParticipant], event);
          this.addParticipantToConnectedParticipant(remoteMeetingParticipant);
        }
      }
    }

    const localMeetingParticipant = await this.createIParticipantMeeting(room.localParticipant, event, false, true);

    this.addParticipantToConnectedParticipant(localMeetingParticipant);
    this.localParticipant = localMeetingParticipant;
    //
    // this.eventRoom.next({
    //   meetingEvent: meetingEventEnum.DominantSpeakerChanged,
    //   data: null
    // });

    await this.setUpRoomEvent(room, event);
  }

  /**
   * Make a IParticipantMeeting
   * @param twilioParticipant
   * @param event
   * @param isDominantSpeaker
   * @param isLocalSpeaker
   * @private
   */
  private async createIParticipantMeeting(twilioParticipant: Participant, event: Event, isDominantSpeaker = false, isLocalSpeaker = false) {
    const remoteUser = await this.userService.getUser(twilioParticipant.identity)

    isDominantSpeaker = twilioParticipant.identity === event.organizedBy.uid

    return {
      identity: twilioParticipant.identity,
      twilioData: twilioParticipant,
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
   * @param event
   */
  setUpRoomEvent(room: Room, event: Event) {

    // When a Participant joins the Room, log the event.
    room.on(meetingEventEnum.ParticipantConnected,
      async (participant: Participant) => {
        const meetingParticipant = await this.createIParticipantMeeting(participant, event);
        this.addParticipantToConnectedParticipant(meetingParticipant);
      });

    // When a Participant adds a Track, attach it to the DOM.
    room.on(meetingEventEnum.TrackSubscribed, (track: RemoteVideoTrack | RemoteAudioTrack, trackPublication: RemoteTrackPublication, participant: Participant) => {
      // this.attachTracks([track], participantContainer, 'participantContainer');

      // this.eventRoom.next({
      //   meetingEvent: meetingEventEnum.TrackSubscribed,
      //   data: {track, trackPublication, participant}
      // });
    });

    // When a Participant removes a Track, detach it from the DOM.
    room.on(meetingEventEnum.TrackUnsubscribed, (track: RemoteVideoTrack | RemoteAudioTrack, trackPublication: RemoteTrackPublication, participant: Participant) => {

      // this.eventRoom.next({
      //   meetingEvent: meetingEventEnum.TrackUnsubscribed,
      //   data: {track, trackPublication, participant}
      // });
      // this.detachTracks([track]);
    });

    // When a Participant leaves the Room, detach its Tracks.
    room.on(meetingEventEnum.ParticipantDisconnected, (participant: Participant) => {
      this.removeParticipantFromConnectedParticipant(participant);
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

      this.disconnected();

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
   * Function call when local participant leave the room
   */
  disconnected() {
    if (!!this.activeRoom) {
      this.deactiveLocalTracks();
      this.activeRoom.disconnect();
    }
  }


  /**
   *
   */
  deactiveLocalTracks() {
    const localParticipant = this.localParticipant.twilioData;
    if (!!!localParticipant) {
      return;
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


}
