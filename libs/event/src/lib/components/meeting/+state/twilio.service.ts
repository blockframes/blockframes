
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
  RemoteDataTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteVideoTrack,
  Room,
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

  initLocal(userName: string) {

    const local: LocalAttendee = {
      id: 'local',
      kind: 'local',
      userName,
      tracks: { video: null, audio: null }
    };
    this.twilioStore.upsert(local.id, local);

    const promises: Promise<void>[] = [];

    if (!local.tracks.video) {
      promises.push(
        createLocalVideoTrack().then(track => {
          const currentLocal = this.twilioQuery.localAttendee;
          this.twilioStore.update(currentLocal.id, entity => ({
            tracks: {
              video: track,
              audio: entity.tracks.audio,
            }
          }));
        }).catch(e => {}) // browser denied audio permission : catch error to avoid breaking and do nothing
      );
    }

    if (!local.tracks.audio) {
      promises.push(
        createLocalAudioTrack().then(track => {
          const currentLocal = this.twilioQuery.localAttendee;
          this.twilioStore.update(currentLocal.id, entity => ({
            tracks: {
              audio: track,
              video: entity.tracks.video,
            }
          }));
        }).catch(e => {}) // browser denied video permission : catch error to avoid breaking and do nothing
      );
    }

    return Promise.all(promises);
  }

  cleanLocal() {
    const cleanTrack = (track: LocalVideoTrack | LocalAudioTrack) => { track?.stop(); track?.removeAllListeners(); }

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

    this.room.on(
      'trackSubscribed',
      (track: (RemoteAudioTrack | RemoteVideoTrack | RemoteDataTrack), publication: RemoteTrackPublication, participant: RemoteParticipant) => {

        if (track.kind === 'data') return;

        this.twilioStore.upsert(
          participant.sid,
          entity => {
            console.log('upserting', track.sid, track.kind);
            const remoteTracks: RemoteTracks = {
              video: null,
              audio: null,
            };

            if (Object.keys(entity).length > 0) {
              remoteTracks.video = track.kind === 'video' ? track : (entity as RemoteAttendee).tracks.video;
              remoteTracks.audio = track.kind === 'audio' ? track : (entity as RemoteAttendee).tracks.audio;
            } else {
              console.log('empty spaghetti');
              (remoteTracks[track.kind] as RemoteAudioTrack | RemoteVideoTrack) = track;
            }

            console.log('->', remoteTracks);
            return { tracks: remoteTracks };
          },
          (id, entity) => {
            console.log('ok we got', entity);
            return { id, kind: 'remote', userName: participant.identity, tracks: entity.tracks}
          },
        );
      },
    );

    this.room.on('participantDisconnected', (participant: RemoteParticipant) => {
      console.log('bye', participant.identity);
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
