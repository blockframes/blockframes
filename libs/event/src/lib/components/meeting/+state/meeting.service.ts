// Angular
import {Injectable} from '@angular/core';

// Blockframes
import {UserService} from "@blockframes/user/+state";
import {Event, EventService} from "@blockframes/event/+state";
import {AuthQuery} from "@blockframes/auth/+state";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

// Rxjs
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {map} from "rxjs/operators";

//Import Twilio-video
import {
  connect, ConnectOptions,
  createLocalTracks,
  LocalAudioTrack,
  LocalDataTrack,
  LocalVideoTrack,
  Participant,
  RemoteParticipant,
  Room
} from 'twilio-video';
import {ErrorResultResponse} from "@blockframes/utils/utils";
import {OrganizationService} from "@blockframes/organization/+state";


/**
 * Enum for all Event twilio we can get
 */
export enum meetingEventEnum {
  ParticipantConnected = 'participantConnected',
  ParticipantDisconnected = 'participantDisconnected',
  TrackSubscribed = 'trackSubscribed',
  TrackUnsubscribed = 'trackUnsubscribed',
  Disconnected = 'disconnected',
  TrackDisabled = 'trackDisabled',
  DominantSpeakerChanged = 'dominantSpeakerChanged',
  TrackEnabled = 'trackEnabled',
  TrackStopped = 'trackStopped',
  TrackStarted = 'trackStarted',
}

/**
 * Interface for the status of video and audio
 */
export interface IStatusVideoMic {
  video: boolean,
  audio: boolean
}


@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  // BehaviorSubject of all Participant connected to room twilio
  // Type of participant : IParticipantMeeting
  private $participantsConnectedDataSource: BehaviorSubject<IParticipantMeeting[]> = new BehaviorSubject([]);

  // BehaviorSubject of local tracks
  // Type of tracks : LocalAudioTrack | LocalVideoTrack (type twilio-video)
  private $localPreviewTracksDataSource: BehaviorSubject<Array<LocalAudioTrack | LocalVideoTrack | LocalDataTrack>> = new BehaviorSubject([]);

  // BehaviorSubject of stauts Video and Audio
  // Type of status : IStatusVideoMic
  protected $localVideoMicStatusDataSource: BehaviorSubject<IStatusVideoMic> = new BehaviorSubject({
    video: false,
    audio: false
  });
  public localVideoMicStatus$: Observable<IStatusVideoMic> = this.$localVideoMicStatusDataSource.asObservable();

  // Twilio data (Participant)
  private twilioParticipant: Map<String, Participant> = new Map<String, Participant>();

  // Active room twilio
  activeRoom: Room;

  previewTracks: (LocalAudioTrack | LocalVideoTrack | LocalDataTrack)[];

  localParticipant: IParticipantMeeting;

  accessToken: string;

  constructor(
    private userService: UserService,
    private orgService: OrganizationService,
    private eventService: EventService,
  ) {
  }

  /**
   *
   * @param uid: string
   */
  getTwilioParticipantDataFromUid(uid: string): Participant {
    return this.twilioParticipant.get(uid);
  }

  /**
   * return Observable of LocalTrack
   */
  getLocalPreviewTracks(): Observable<Array<LocalAudioTrack | LocalVideoTrack | LocalDataTrack>> {
    return this.$localPreviewTracksDataSource.asObservable();
  }

  /**
   * Return Observable of all participant connected to room twilio
   */
  getConnectedAllParticipants(): Observable<IParticipantMeeting[]> {
    return this.$participantsConnectedDataSource.asObservable();
  }

  /**
   * Get all participant of the twilio room without the local participant
   */
  getConnectedRemoteParticipants(): Observable<IParticipantMeeting[]> {
    return this.$participantsConnectedDataSource
      .pipe(
        map(participants => participants.filter(participant => !participant.isLocalSpeaker)
        )
      );
  }

  /**
   * function to remove a specific participant from the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to remove
   */
  removeParticipantFromConnectedParticipant(participant: IParticipantMeeting | Participant) {
    const roomArr: IParticipantMeeting[] = this.$participantsConnectedDataSource.getValue();
    const updatedParticipants = roomArr.filter((item:IParticipantMeeting) => item.identity !== participant.identity)
    this.$participantsConnectedDataSource.next(updatedParticipants);
    this.twilioParticipant.delete(participant.identity);
  }

  /**
   * function to add a specific participant to the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to add
   */
  addParticipantToConnectedParticipant(participant: IParticipantMeeting, participantTwilio: Participant) {
    const currentValue = this.$participantsConnectedDataSource.getValue();
    if(currentValue.some((item) => item.identity === participant.identity)){
      return;
    }
    const newCurrentValue = [...currentValue, participant]
    this.$participantsConnectedDataSource.next(newCurrentValue);
    this.twilioParticipant.set(participant.identity, participantTwilio);
  }

  getLocalVideoMicStatus(): Observable<IStatusVideoMic> {
    return this.localVideoMicStatus$;
  }

  async getIfAudioIsAvailable() {
    const userMedia = await navigator.mediaDevices.getUserMedia({audio: true});
    if(!!userMedia){
      this.doSetupLocalVideoAndAudio('audio', true);
      return true;
    } else {
      this.doSetupLocalVideoAndAudio('audio', false);
      return false;
    }
  }

  async getIfVideoIsAvailable() {
    const userMedia = await navigator.mediaDevices.getUserMedia({video: true});
    if(!!userMedia){
      this.doSetupLocalVideoAndAudio('video', true);
      return true;
    } else {
      this.doSetupLocalVideoAndAudio('video', false);
      return false;
    }
  }

  /**
   * Create LocalParticipant's Tracks and send it Twilio;
   */
  async doCreateLocalPreview() {

    if (!this.previewTracks || this.previewTracks.length === 0) {
      this.previewTracks = await createLocalTracks();
    }

    this.$localPreviewTracksDataSource.next(this.previewTracks);
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
    return Array.from(participants.values())
  }


  /**
   * Function to begin the connection to twilio
   * First we get the access token with de cloud function
   * Second we connect to the room with the access token
   * @param event
   */
  async doConnectToMeetingService(event) {
    const response = await this.eventService.getTwilioAccessToken(event.id)
    if (response.error !== '') {
      throw new Error(response.error);
    } else {
      const audio: boolean = await this.getIfAudioIsAvailable();
      const video: boolean = await this.getIfVideoIsAvailable();
      this.accessToken = response.result;
      await this._connectToTwilioRoom(this.accessToken, audio, video, event);
    }
  }


  /**
   * Connection to twilio with the access token and option of connection
   * @param accessToken - string - access Token for twilio
   * @param audio - boolean
   * @param video - boolean
   * @param event - string - All event we come from
   */
  private async _connectToTwilioRoom(accessToken: string, audio: boolean, video: boolean, event: Event) {

    const connectOptions: ConnectOptions = {
      name: event.id,
      dominantSpeaker: false,
      audio: audio,
      video: video,
      bandwidthProfile: {
        video: {
          mode: 'grid',
          renderDimensions: {
            low: {width: 640, height: 480},
            standard: {width: 640, height: 480},
            high: {width: 640, height: 480},
          },
        },
      },
      tracks: (this.previewTracks) ?? null,
      networkQuality: {local: 1, remote: 1}
    };

    await connect(accessToken, connectOptions).then((r: Room) => this.roomJoined(r, event), (error) => {
      throw new Error(error);
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

    if (!!room.participants) {
      const participants = this.getParticipantOfParticipantsMapAlreadyInRoom(room.participants);
      // FIXME !!!!!!!!!
      // const remoteMeetingParticipants = [];
      // participants.forEach(participant => {
      //   remoteMeetingParticipants.push([this.createIParticipantMeeting(participant.identity, event), participant]);
      // })
      // await Promise.all(remoteMeetingParticipants);
      // remoteMeetingParticipants.forEach(participant => {
      //   this.addParticipantToConnectedParticipant(remoteMeetingParticipant, participants);
      // })

      for (const indexParticipant in participants) {
        const remoteMeetingParticipant = await this.createIParticipantMeeting(participants[indexParticipant].identity, event);
        this.addParticipantToConnectedParticipant(remoteMeetingParticipant, participants[indexParticipant]);
      }
    }

    this.localParticipant = await this.createIParticipantMeeting(room.localParticipant.identity, event, true );
    this.addParticipantToConnectedParticipant(this.localParticipant, room.localParticipant);

    this.setUpRoomEvent(room, event);
  }


  /**
   * Make a IParticipantMeeting
   * @param identity
   * @param event
   * @param isLocalSpeaker
   * @private
   */
  private async createIParticipantMeeting(identity: string, event: Event, isLocalSpeaker = false): Promise<IParticipantMeeting> {
    const remoteUser = await this.userService.getUser(identity);
    const remoteOrg = await this.orgService.getValue(remoteUser.orgId);

    const isDominantSpeaker = identity === event.organizedBy.uid;

    return {
      identity: identity,
      festivalData: {
        firstName: remoteUser.firstName,
        lastName: remoteUser.lastName,
        avatar: remoteUser.avatar,
        organizationName: remoteOrg.denomination.full,
      },
      isDominantSpeaker: isDominantSpeaker,
      isLocalSpeaker: isLocalSpeaker,
    };
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
        const meetingParticipant = await this.createIParticipantMeeting(participant.identity, event);
        this.addParticipantToConnectedParticipant(meetingParticipant, participant);
      });

    // When a Participant leaves the Room, detach its Tracks.
    room.on(meetingEventEnum.ParticipantDisconnected, (participant: Participant) => {
      this.removeParticipantFromConnectedParticipant(participant);
    });

    // Once the LocalParticipant leaves the room, detach the Tracks
    // of all Participants, including that of the LocalParticipant.
    room.on(meetingEventEnum.Disconnected, () => {
      this.doDisconnected();
    });
  }


  /**
   * Mute/unmute your local media.
   * @param kind: string = 'video' || 'audio'  - The type of media you want to mute/unmute
   * @param mute - bool - mute/unmute
   */
  muteOrUnmuteYourLocalMediaPreview(kind: string, mute: boolean) {
    //get local track
    const localTwilioData = this.getTwilioParticipantDataFromUid(this.localParticipant.identity)
    const localTracks = this.getTracksOfParticipant(localTwilioData);
    console.log('localTracks : ', localTracks)
    this.doSetupLocalVideoAndAudio(kind, !mute);

    let track: any;
    //get audio or video track
    if (kind === localTracks[0].kind) {
      track = localTracks[0].track;
    } else {
      track = localTracks[1].track;
    }

    if (mute) {
      track.disable();
      track.stop();
    } else {
      track.enable();
      track.restart();
    }
  }


  /**
   *
   * @param kind: string = 'video' || 'audio' - The type of media you want to mute/unmute
   * @param boolToChange: boolean
   */
  doSetupLocalVideoAndAudio(kind: string, boolToChange: boolean) {
    const statusVideoAudio: IStatusVideoMic = this.$localVideoMicStatusDataSource.getValue();
    if (kind === 'video') {
      statusVideoAudio.video = boolToChange;
      this.$localVideoMicStatusDataSource.next(statusVideoAudio);
    } else {
      statusVideoAudio.audio = boolToChange;
      this.$localVideoMicStatusDataSource.next(statusVideoAudio);
    }
  }


  /**
   * Function call when local participant leave the room
   */
  doDisconnected() {
    if (!!this.activeRoom) {
      this.twilioParticipant.clear();
      this.$participantsConnectedDataSource.next([]);
      this.deactiveLocalTracks(this.activeRoom);
      this.activeRoom.disconnect();
    }
  }


  /**
   * Deactive local track of active Room
   * @param activeRoom: Room (twilio-video Object)
   */
  deactiveLocalTracks(activeRoom) {
    if(!!activeRoom){
      const arrayOfLocalTrack = [];
      activeRoom.localParticipant.tracks.forEach((track) => {
        arrayOfLocalTrack.push(track.track);
        track.track.stop();
      });
      if(!!arrayOfLocalTrack && arrayOfLocalTrack.length > 0){
        activeRoom.localParticipant.unpublishTracks(arrayOfLocalTrack);
      }
      activeRoom.localParticipant.tracks.forEach((track) => {
        track.track.detach();
      });
    }
  }


}
