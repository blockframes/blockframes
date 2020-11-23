
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ErrorResultResponse } from '@blockframes/utils/utils';

import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  connect,
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteVideoTrack,
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

  constructor(
    private functions: AngularFireFunctions,
    private twilioStore: TwilioStore,
    private twilioQuery: TwilioQuery,
  ) { }

  getToken(eventId: string) {
    return this.getAccessToken({ eventId }).toPromise<ErrorResultResponse>();
  }

  async initLocal(userName: string) {

    const local: LocalAttendee = {
      id: 'local',
      kind: 'local',
      userName,
      tracks: { video: null, audio: null }
    };
    this.twilioStore.upsert(local.id, local);

    const promises: Promise<LocalVideoTrack | LocalAudioTrack>[] = [];

    if (!local.tracks.video) {
      promises.push(createLocalVideoTrack().catch(e => null));
    }

    if (!local.tracks.audio) {
      promises.push(createLocalAudioTrack().catch(e => null));
    }

    const [ video, audio ] = await Promise.all(promises);

    this.twilioStore.update(
      local.id,
      (entity: LocalAttendee) => ({
        tracks: {
          video: (video as LocalVideoTrack) ?? entity.tracks.video,
          audio: (audio as LocalAudioTrack) ?? entity.tracks.audio,
        }
      })
    );
  }

  cleanLocal() {
    const cleanTrack = (track: LocalVideoTrack | LocalAudioTrack) => {
      track?.stop();
      track?.removeAllListeners();
    }

    const local = this.twilioQuery.localAttendee;
    cleanTrack(local.tracks.video);
    cleanTrack(local.tracks.audio);

    this.twilioStore.remove(local.id);
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
    if (!!this.room) return;

    // Get Twilio token & ensure that there is no error
    const response = await this.getToken(eventId);
    if (response.error) {
      throw new Error(`${response.error}: ${response.result}`);
    }
    const token = response.result;


    const localTracks = this.twilioQuery.localAttendee.tracks;

    const tracks: (LocalVideoTrack | LocalAudioTrack)[] = [];
    if (!!localTracks.audio) tracks.push(localTracks.audio);
    if (!!localTracks.video) tracks.push(localTracks.video);

    // Connect to Twilio room and register event listeners
    this.room = await connect(token, { name: eventId, tracks });

    this.room.on('participantConnected', (participant: RemoteParticipant) => {
      this.twilioStore.upsert(
        participant.sid,
        {
          id: participant.sid,
          kind: 'remote',
          userName: participant.identity,
          tracks: {
            audio: null,
            video: null,
          }
        }
      );
    });

    this.room.on(
      'trackSubscribed',
      (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {

        if (track.kind === 'data') return;

        this.twilioStore.upsert(
          participant.sid,
          (entity: RemoteAttendee) => {
            const remoteTracks: RemoteTracks = {
              video: null,
              audio: null,
            };

            if (Object.keys(entity).length > 0) {
              remoteTracks.video = track.kind === 'video' ? track : entity.tracks.video;
              remoteTracks.audio = track.kind === 'audio' ? track : entity.tracks.audio;
            } else {
              (remoteTracks[track.kind] as RemoteAudioTrack | RemoteVideoTrack) = track;
            }

            return { tracks: remoteTracks };
          },
          (id, entity) => {
            return { id, kind: 'remote', userName: participant.identity, tracks: entity.tracks}
          },
        );
      },
    );

    this.room.on('participantDisconnected', (participant: RemoteParticipant) => {
      this.twilioStore.remove(participant.sid);
    });
  }

  disconnect() {
    if (!this.room) return;

    this.room.disconnect();
    this.room.removeAllListeners();
    this.room = null;

    this.cleanLocal();

    this.twilioStore.remove(); // delete all entities from the store
  }

}
