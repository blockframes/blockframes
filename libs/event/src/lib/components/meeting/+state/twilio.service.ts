
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ErrorResultResponse } from '@blockframes/utils/utils';

import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  connect,
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  Room,
  RemoteTrack,
} from 'twilio-video';

import {
  TrackKind,
  RemoteTracks,
  LocalAttendee,
  RemoteAttendee,
} from './twilio.model';
import { TwilioQuery } from './twilio.query';
import { TwilioStore } from './twilio.store';


@Injectable({ providedIn: 'root' })
export class TwilioService {

  private room: Room;
  private getAccessToken = this.functions.httpsCallable('getAccessToken');

  private preference: {[K in TrackKind]: boolean} = { 'video': true, 'audio': true };

  constructor(
    private functions: AngularFireFunctions,
    private twilioStore: TwilioStore,
    private twilioQuery: TwilioQuery,
  ) { }

  getToken(eventId: string) {
    return this.getAccessToken({ eventId }).toPromise<ErrorResultResponse>();
  }

  togglePreference(kind: TrackKind) {
    this.preference[kind] = !this.preference[kind];
  }

  async initLocal(userName: string) {

    const local: LocalAttendee = {
      id: 'local',
      kind: 'local',
      userName,
      tracks: {},
    };
    this.twilioStore.upsert(local.id, local);

    const [ video, audio ] = await Promise.all([
      createLocalVideoTrack().catch(() => null),
      createLocalAudioTrack().catch(() => null)
    ]) as [ LocalVideoTrack | null, LocalAudioTrack | null ];

    // check user preference and disable tracks accordingly
    if (!this.preference['video']) video.disable();
    if (!this.preference['audio']) audio.disable();

    this.twilioStore.update(local.id, { tracks: { video, audio } });
  }

  cleanLocal() {
    const local = this.twilioQuery.localAttendee;

    if (!local) return;

    const cleanTrack = (track: LocalVideoTrack | LocalAudioTrack) => {
      track?.stop();
      track?.removeAllListeners();
    }

    cleanTrack(local?.tracks?.video);
    cleanTrack(local?.tracks?.audio);

    this.twilioStore.remove(local?.id);
  }

  toggleTrack(kind: TrackKind) {
    const track = this.twilioQuery.localAttendee.tracks[kind];

    if (!track) return;

    if (track.isEnabled) {
      track.disable();
    } else {
      track.enable();
    }
  }

  async connect(eventId: string) {
    if (this.room) return;

    // Get Twilio token & ensure that there is no error
    const response = await this.getToken(eventId);
    if (response.error) {
      throw new Error(`${response.error}: ${response.result}`);
    }
    const token = response.result;

    if (!this.twilioQuery.localAttendee) {
      console.warn('CANNOT CONNECT WITHOUT A LOCAL ATTENDEE: call `initLocal()` first!');
      return;
    }
    const localTracks = this.twilioQuery.localAttendee.tracks;

    const tracks: (LocalVideoTrack | LocalAudioTrack)[] = [];
    if (localTracks.audio) tracks.push(localTracks.audio);
    if (localTracks.video) tracks.push(localTracks.video);

    // Connect to Twilio room and register event listeners
    this.room = await connect(token, { name: eventId, tracks });

    this.room.participants.forEach((participant: RemoteParticipant) => {
      this.twilioStore.upsert(participant.sid, { id: participant.sid, kind: 'remote', userName: JSON.parse(participant.identity).displayName,  tracks: {} })
    })

    this.room.on('participantConnected', (participant: RemoteParticipant) => {
      this.twilioStore.upsert(
        participant.sid,
        { id: participant.sid, kind: 'remote', userName: JSON.parse(participant.identity).displayName, tracks: {} }
      );
    });

    this.room.on(
      'trackSubscribed',
      (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === 'data') return;
        const remoteTracks: RemoteTracks = { [track.kind]: track };
        this.twilioStore.upsert(
          participant.sid,
          (entity: RemoteAttendee) => ({ tracks: { ...entity.tracks, ...remoteTracks } }),
          id => ({ id, kind: 'remote', userName: JSON.parse(participant.identity).displayName, tracks: remoteTracks })
        );
      },
    );

    this.room.on('participantDisconnected', (participant: RemoteParticipant) => {
      this.twilioStore.remove(participant.sid);
    });
  }

  disconnect() {
    this.cleanLocal();

    if (!this.room) return;

    this.room.disconnect();
    this.room.removeAllListeners();
    this.room = null;

    this.twilioStore.remove(); // delete all entities from the store
  }

}
