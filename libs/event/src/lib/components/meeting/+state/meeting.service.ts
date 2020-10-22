// Angular
import {Injectable} from '@angular/core';

// Blockframes
import {User, UserService} from "@blockframes/user/+state";
import {Event, EventService} from "@blockframes/event/+state";
import {
  IParticipantMeeting,
  IStatusVideoAudio,
  meetingEventEnum
} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {Organization, OrganizationService} from "@blockframes/organization/+state";
import {ErrorResultResponse} from "@blockframes/utils/utils";

// Rxjs
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";

// Twilio-video
import {
  connect,
  createLocalAudioTrack,
  createLocalVideoTrack,
  ConnectOptions,
  LocalAudioTrack,
  LocalAudioTrackPublication,
  LocalDataTrack,
  LocalTrack,
  LocalVideoTrack,
  LocalVideoTrackPublication,
  Participant,
  Room
} from 'twilio-video';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  /**
   * BehaviorSubject of all Participant connected to room twilio
   * Type of participant : IParticipantMeeting
   * @private
   */
  private connectedParticipants$: BehaviorSubject<IParticipantMeeting[]> = new BehaviorSubject([]);

  private twilioParticipants: Map<String, Participant> = new Map<String, Participant>();

  activeRoom: Room;

  previewTracks: (LocalAudioTrack | LocalVideoTrack | LocalDataTrack)[];

  accessToken: string;

  localParticipant: IParticipantMeeting;

  constructor(
    private userService: UserService,
    private orgService: OrganizationService,
    private eventService: EventService,
  ) {
  }

  /**
   * Get Twilio participant from uid of User
   * @param uid: string
   */
  getTwilioParticipant(uid: string): Participant {
    return this.twilioParticipants.get(uid);
  }

  /**
   * Get all participant of the twilio room without the local participant
   */
  getParticipants(): Observable<IParticipantMeeting[]> {
    return this.connectedParticipants$
      .pipe(
        map((participants) => participants.filter((participant) => !participant.isLocalSpeaker)
        )
      );
  }

  /**
   * function to remove a specific participant from the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to remove
   */
  removeParticipant(participant: IParticipantMeeting | Participant): void {
    const roomArr: IParticipantMeeting[] = this.connectedParticipants$.getValue();
    const updatedParticipants: IParticipantMeeting[] = roomArr.filter((item: IParticipantMeeting) => item.identity !== participant.identity)
    this.twilioParticipants.delete(participant.identity);
    this.connectedParticipants$.next(updatedParticipants);
  }

  /**
   * function to add a specific participant to the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to add
   * @param participantTwilio: Participant : Participant twilio
   */
  addParticipant(participant: IParticipantMeeting, participantTwilio: Participant): void {
    const currentValue: IParticipantMeeting[] = this.connectedParticipants$.getValue();
    if (currentValue.some((item) => item.identity === participant.identity)) {
      return;
    }
    const newCurrentValue: IParticipantMeeting[] = [...currentValue, participant];
    this.twilioParticipants.set(participant.identity, participantTwilio);
    this.connectedParticipants$.next(newCurrentValue);
  }

  async isAudioAvailable(): Promise<boolean> {
    try {
      await navigator.mediaDevices.getUserMedia({audio: true});
      return true;
    } catch (err) {
      return false;
    }
  }

  async isVideoAvailable(): Promise<boolean> {
    try {
      await navigator.mediaDevices.getUserMedia({video: true});
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Create LocalParticipant's Tracks and send it Twilio;
   * get local track if here or recreate local track for twilio
   */
  async createPreview(audio: boolean, video: boolean): Promise<void> {
    const audioTrack: Promise<LocalAudioTrack | null> = (!!audio) ? createLocalAudioTrack() : null;
    const videoTrack: Promise<LocalVideoTrack | null> = (!!video) ? createLocalVideoTrack() : null;

    const tracks: LocalTrack[] = await Promise.all([audioTrack, videoTrack]);
    this.previewTracks = tracks.filter((track) => !!track);
  }

  /**
   * Function to begin the connection to twilio
   * First we get the access token with de cloud function
   * Second we connect to the room with the access token
   * @param event
   * @param identity
   * @param audio
   * @param video
   */
  async connectToMeeting(event: Event, identity: string, audio: boolean, video: boolean): Promise<void> {
    const response: ErrorResultResponse = await this.eventService.getTwilioAccessToken(event.id)
    if (response.error !== '') {
      throw new Error(response.error);
    } else {
      this.accessToken = response.result;
      const connectOptions: ConnectOptions = {
        name: event.id,
        dominantSpeaker: false,
        audio: audio,
        video: video,
        bandwidthProfile: {
          video: {
            mode: 'grid'
          },
        },
        tracks: (this.previewTracks) ?? [],
        networkQuality: {local: 1, remote: 1}
      };

      const room: Room = await connect(this.accessToken, connectOptions);
      if (!!room) {
        await this.roomJoined(room, event, audio, video);
      }
    }
  }

  /**
   * When successfully connected to room.
   * @param room - room twilio where we are connected
   * @param event - event when we com from / cascade8
   * @param audio: boolean
   * @param video: boolean
   */
  async roomJoined(room: Room, event: Event, audio: boolean, video: boolean): Promise<void> {
    this.activeRoom = room;

    if (!!room.participants) {
      const participants: Participant[] = Array.from(room.participants.values());
      const tracks: (Promise<void | Participant>)[] = [];
      participants.forEach((participant: Participant) => {
        tracks.push(
          this.createIParticipantMeeting(participant.identity, event)
            .then(remoteParticipant => {
              this.addParticipant(remoteParticipant, participant)
            })
        );
      });
      await Promise.all(tracks);
    }

    this.localParticipant = await this.createIParticipantMeeting(room.localParticipant.identity, event, true, video, audio);
    this.addParticipant(this.localParticipant, room.localParticipant);
    this.setUpRoomEvent(room, event);
  }


  /**
   * Make a IParticipantMeeting
   * @param identity
   * @param event
   * @param isLocalSpeaker
   * @param video: boolean
   * @param audio: boolean
   * @private
   */
  private async createIParticipantMeeting(
    identity: string,
    event: Event,
    isLocalSpeaker = false,
    video: boolean = false,
    audio: boolean = false
  ): Promise<IParticipantMeeting> {
    const remoteUser: User = await this.userService.getUser(identity);
    const remoteOrg: Organization = await this.orgService.getValue(remoteUser.orgId);

    const isDominantSpeaker = remoteUser.orgId === event.ownerId;

    return {
      identity: identity,
      statusMedia: {
        audio: audio,
        video: video,
      },
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
  setUpRoomEvent(room: Room, event: Event): void {

    room.on(meetingEventEnum.ParticipantConnected,
      async (participant: Participant) => {
        const meetingParticipant = await this.createIParticipantMeeting(participant.identity, event);
        this.addParticipant(meetingParticipant, participant);
      });

    room.on(meetingEventEnum.ParticipantDisconnected, (participant: Participant) => {
      this.removeParticipant(participant);
    });

    room.on(meetingEventEnum.Disconnected, () => {
      this.disconnect();
    });
  }

  /**
   *
   * @param identity: string, Uid of user connected
   * @param kind: string = 'video' || 'audio' - The type of media you want to mute/unmute
   * @param boolToChange: boolean
   */
  setupVideoAudio(identity: string, kind: keyof IStatusVideoAudio, boolToChange: boolean): void {
    const participants: IParticipantMeeting[] = this.connectedParticipants$.getValue();
    const updatedParticipant: IParticipantMeeting = participants.find(value => value.identity === identity);
    const otherParticipant: IParticipantMeeting[] = participants.filter(value => value.identity !== identity);
    updatedParticipant.statusMedia[kind] = boolToChange;
    this.connectedParticipants$.next([...otherParticipant, updatedParticipant])
  }


  /**
   * Function call when local participant leave the room
   */
  disconnect(): void {
    if (!!this.activeRoom) {
      this.twilioParticipants.clear();
      this.deactivateLocalTracks(this.activeRoom);

      this.activeRoom.removeAllListeners();
      this.activeRoom.disconnect();
      this.connectedParticipants$.next([]);
    }
  }


  /**
   * Deactive local track of active Room
   * @param activeRoom: Room (twilio-video Object)
   */
  deactivateLocalTracks(activeRoom: Room): void {
    if (!!activeRoom) {
      const arrayOfLocalTrack: (LocalAudioTrack | LocalVideoTrack)[] = [];
      activeRoom.localParticipant.tracks.forEach((track: (LocalAudioTrackPublication | LocalVideoTrackPublication)) => {
        arrayOfLocalTrack.push(track.track);
        track.track.stop();
      });
      if (!!arrayOfLocalTrack && arrayOfLocalTrack.length > 0) {
        activeRoom.localParticipant.unpublishTracks(arrayOfLocalTrack);
      }
      activeRoom.localParticipant.tracks.forEach((track: (LocalAudioTrackPublication | LocalVideoTrackPublication)) => {
        track.track.detach();
      });
    }
  }
}
