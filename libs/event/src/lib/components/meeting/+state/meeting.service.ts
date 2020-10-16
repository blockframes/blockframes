// Angular
import {Injectable} from '@angular/core';

// Blockframes
import {UserService} from "@blockframes/user/+state";
import {Event, EventService} from "@blockframes/event/+state";
import {IParticipantMeeting, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {OrganizationService} from "@blockframes/organization/+state";

// Rxjs
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";

//Import Twilio-video
import {
  connect,
  createLocalAudioTrack,
  createLocalVideoTrack,
  ConnectOptions,
  LocalAudioTrack,
  LocalDataTrack,
  LocalVideoTrack,
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
        map(participants => participants.filter(participant => !participant.isLocalSpeaker)
        )
      );
  }

  /**
   * function to remove a specific participant from the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to remove
   */
  removeParticipant(participant: IParticipantMeeting | Participant) {
    const roomArr: IParticipantMeeting[] = this.connectedParticipants$.getValue();
    const updatedParticipants = roomArr.filter((item: IParticipantMeeting) => item.identity !== participant.identity)
    this.twilioParticipants.delete(participant.identity);
    this.connectedParticipants$.next(updatedParticipants);
  }

  /**
   * function to add a specific participant to the array of participant connected (participantConnected$)
   * @param participant: IParticipantMeeting : Participant to add
   * @param participantTwilio: Participant : Participant twilio
   */
  addParticipant(participant: IParticipantMeeting, participantTwilio: Participant) {
    const currentValue = this.connectedParticipants$.getValue();
    if (currentValue.some((item) => item.identity === participant.identity)) {
      return;
    }
    const newCurrentValue = [...currentValue, participant];
    this.twilioParticipants.set(participant.identity, participantTwilio);
    this.connectedParticipants$.next(newCurrentValue);
  }

  isAudioAvailable() {
    return navigator.mediaDevices.getUserMedia({audio: true})
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      })
  }

  isVideoAvailable() {
    return navigator.mediaDevices.getUserMedia({video: true})
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      })
  }

  /**
   * Create LocalParticipant's Tracks and send it Twilio;
   * get local track if here or recreate local track for twilio
   */
  async createPreview(audio, video) {
    const audioTrack = (!!audio) ? createLocalAudioTrack() : null;
    const videoTrack = (!!video) ? createLocalVideoTrack() : null;

    const tracks = await Promise.all([audioTrack, videoTrack]);
    this.previewTracks = tracks.filter(value => !!value);
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
  async connectToMeeting(event: Event, identity: string, audio: boolean, video: boolean) {
    const response = await this.eventService.getTwilioAccessToken(event.id)
    if (response.error !== '') {
      throw new Error(response.error);
    } else {
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
      tracks: (this.previewTracks) ?? [],
      networkQuality: {local: 1, remote: 1}
    };

    await connect(accessToken, connectOptions).then((r: Room) => this.roomJoined(r, event, audio, video), (error) => {
      throw new Error(error);
    });
  }


  /**
   * When successfully connected to room.
   * @param room - room twilio where we are connected
   * @param event - event when we com from / cascade8
   * @param audio: boolean
   * @param video: boolean
   */
  async roomJoined(room: Room, event: Event, audio: boolean, video: boolean) {
    this.activeRoom = room;

    if (!!room.participants) {
      const participants = Array.from(room.participants.values());
      const tracks = [];
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

    const localParticipant = await this.createIParticipantMeeting(room.localParticipant.identity, event, true, video, audio);
    this.addParticipant(localParticipant, room.localParticipant);
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
  private async createIParticipantMeeting(identity: string, event: Event, isLocalSpeaker = false, video: boolean = false, audio: boolean = false): Promise<IParticipantMeeting> {
    const remoteUser = await this.userService.getUser(identity);
    const remoteOrg = await this.orgService.getValue(remoteUser.orgId);

    const isDominantSpeaker = event.isOwner;

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
  setUpRoomEvent(room: Room, event: Event) {

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
  setupVideoAudio(identity: string, kind: string, boolToChange: boolean) {
    const participants: IParticipantMeeting[] = this.connectedParticipants$.getValue();
    const updatedParticipant = participants.find(value => value.identity === identity);
    const otherParticipant = participants.filter(value => value.identity !== identity);

    if (kind === 'video') {
      updatedParticipant.statusMedia.video = boolToChange;
    } else {
      updatedParticipant.statusMedia.audio = boolToChange;
    }
    this.connectedParticipants$.next([...otherParticipant, updatedParticipant])
  }


  /**
   * Function call when local participant leave the room
   */
  disconnect() {
    if (!!this.activeRoom) {
      this.twilioParticipants.clear();
      this.connectedParticipants$.next([]);
      this.deactivateLocalTracks(this.activeRoom);
      this.activeRoom.disconnect();
    }
  }


  /**
   * Deactive local track of active Room
   * @param activeRoom: Room (twilio-video Object)
   */
  deactivateLocalTracks(activeRoom) {
    if (!!activeRoom) {
      const arrayOfLocalTrack = [];
      activeRoom.localParticipant.tracks.forEach((track) => {
        arrayOfLocalTrack.push(track.track);
        track.track.stop();
      });
      if (!!arrayOfLocalTrack && arrayOfLocalTrack.length > 0) {
        activeRoom.localParticipant.unpublishTracks(arrayOfLocalTrack);
      }
      activeRoom.localParticipant.tracks.forEach((track) => {
        track.track.detach();
      });
    }
  }


}
