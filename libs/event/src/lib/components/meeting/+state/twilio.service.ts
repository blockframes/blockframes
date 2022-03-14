
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { PublicUser } from '@blockframes/model';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

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
  LocalVideoTrackPublication,
  LocalAudioTrackPublication,
} from 'twilio-video';

import {
  TrackKind,
  RemoteTracks,
  LocalAttendee,
  RemoteAttendee,
  createRemoteAttendee,
  Attendees,
} from './twilio.model';

type GetAttendee<Id> = Id extends 'local' ? LocalAttendee : RemoteAttendee;

@Injectable({ providedIn: 'root' })
export class TwilioService {

  private room: Room;
  private getAccessToken = this.functions.httpsCallable('getAccessToken');

  private preference: { [K in TrackKind]: boolean } = { 'video': true, 'audio': true };

  private _attendees = new BehaviorSubject<Attendees>({});
  private _attendees$ = this._attendees.asObservable();
  attendees$ = this._attendees.asObservable().pipe(map(p => Object.values(p)));
  localAttendee$ = this._attendees$.pipe(map(p => p['local'] as LocalAttendee));

  get localAttendee() {
    return this._attendees.value['local'] as LocalAttendee;
  }

  constructor(private functions: AngularFireFunctions) { }

  getToken(eventId: string, credentials: Partial<PublicUser>) {
    return this.getAccessToken({ eventId, credentials }).toPromise<ErrorResultResponse>();
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
    this.upsertAttendee(local.id, local);

    const [video, audio] = await Promise.all([
      createLocalVideoTrack().catch(() => null),
      createLocalAudioTrack().catch(() => null)
    ]) as [LocalVideoTrack | null, LocalAudioTrack | null];

    // check user preference and disable tracks accordingly
    if (!this.preference['video']) video.disable();
    if (!this.preference['audio']) audio.disable();

    this.upsertAttendee(local.id, { ...local, tracks: { video, audio } });
  }

  cleanLocal() {
    const local = this.localAttendee;

    if (!local) return;

    const cleanTrack = (track: LocalVideoTrack | LocalAudioTrack) => {
      track?.stop();
      track?.removeAllListeners();
    }

    cleanTrack(local.tracks?.video);
    cleanTrack(local.tracks?.audio);

    this.removeAttendee(local.id);
  }

  async toggleTrack(kind: TrackKind) {
    const localAttendee = this.localAttendee;
    const track = localAttendee.tracks[kind];
    if (!track) return;

    if (track.isEnabled) {
      track.disable();
      track.stop();

      this.upsertAttendee(localAttendee.id, {
        ...localAttendee,
        tracks: {
          video: kind === 'video' ? track as LocalVideoTrack : localAttendee.tracks.video,
          audio: kind === 'audio' ? track as LocalAudioTrack : localAttendee.tracks.audio
        }
      });

      if (this.room) {
        const key = kind === 'video' ? 'videoTracks' : 'audioTracks';
        this.room.localParticipant[key].forEach((publication: LocalVideoTrackPublication | LocalAudioTrackPublication) => {
          publication.track.stop();
          publication.unpublish();
        })
      }
    } else {
      // https://www.twilio.com/docs/video/javascript-getting-started#mute-and-unmute-audio-and-video
      const localTrack = kind === 'video'
        ? await createLocalVideoTrack().catch(() => null)
        : await createLocalAudioTrack().catch(() => null);

      this.upsertAttendee(localAttendee.id, {
        ...localAttendee,
        tracks: {
          video: kind === 'video' ? localTrack as LocalVideoTrack : localAttendee.tracks.video,
          audio: kind === 'audio' ? localTrack as LocalAudioTrack : localAttendee.tracks.audio
        }
      });

      if (this.room) {
        this.room.localParticipant.publishTrack(localTrack);
      }
    }
  }

  async connect(eventId: string, credentials: Partial<PublicUser>) {
    if (this.room) return;

    // Get Twilio token & ensure that there is no error
    const response = await this.getToken(eventId, credentials);
    if (response.error) {
      throw new Error(`${response.error}: ${response.result}`);
    }
    const token = response.result;

    if (!this.localAttendee) {
      console.warn('CANNOT CONNECT WITHOUT A LOCAL ATTENDEE: call `initLocal()` first!');
      return;
    }
    const localTracks = this.localAttendee.tracks;

    const tracks: (LocalVideoTrack | LocalAudioTrack)[] = [];
    if (localTracks.audio) tracks.push(localTracks.audio);
    if (localTracks.video) tracks.push(localTracks.video);

    // Connect to Twilio room and register event listeners
    this.room = await connect(token, { name: eventId, tracks });

    // Existing participants list
    this.room.participants.forEach((participant: RemoteParticipant) => {
      this.upsertAttendee(participant.sid, createRemoteAttendee(participant));
    })

    // A new participant connected to room
    this.room.on('participantConnected', (participant: RemoteParticipant) => {
      this.upsertAttendee(participant.sid, createRemoteAttendee(participant));
    });

    // When other (already connected or new) participants activate audio or video
    this.room.on(
      'trackSubscribed',
      (track: RemoteTrack, _: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === 'data') return;
        const remoteTracks: RemoteTracks = { [track.kind]: track };

        this.addTracks(participant.sid, participant, remoteTracks);
      },
    );

    // When other already connected participants deactivate audio or video or leave the room
    this.room.on(
      'trackUnsubscribed',
      (track: RemoteTrack, _: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === 'data') return;
        const remoteTracks: RemoteTracks = { [track.kind]: null };

        this.addTracks(participant.sid, participant, remoteTracks);
      }
    )

    // A participant leaved the room
    this.room.on('participantDisconnected', (participant: RemoteParticipant) => {
      this.removeAttendee(participant.sid);
    });
  }

  disconnect() {
    this.cleanLocal();

    if (!this.room) return;

    this.room.disconnect();
    this.room.removeAllListeners();
    this.room = null;

    this.removeAllAttendees();
  }

  private addTracks(id: string, participant: RemoteParticipant, tracks: RemoteTracks) {
    const remoteAttendee = createRemoteAttendee(participant, tracks);
    const existingAttendee = this.getAttendee(id);
    this.upsertAttendee(id, existingAttendee ? { ...existingAttendee, tracks: { ...existingAttendee.tracks, ...tracks } } : remoteAttendee);
  }

  private upsertAttendee(id: string, attendee: LocalAttendee | RemoteAttendee) {
    const existingAttendees = this._attendees.value;
    existingAttendees[id] = attendee as GetAttendee<typeof id>;
    this._attendees.next(existingAttendees);
  }

  private removeAttendee(id: string) {
    const existingAttendees = this._attendees.value;
    delete existingAttendees[id];
    this._attendees.next(existingAttendees);
  }

  private getAttendee(id: string) {
    return this._attendees.value[id] as RemoteAttendee;
  }

  private removeAllAttendees() {
    this._attendees.next({});
  }
}
