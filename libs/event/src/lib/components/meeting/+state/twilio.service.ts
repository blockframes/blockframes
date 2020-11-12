
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { createLocalAudioTrack, createLocalVideoTrack } from 'twilio-video';
import { TrackKind, Tracks } from './twilio.model';


@Injectable({ providedIn: 'root' })
export class TwilioService {

  track: Tracks = {
    video: null,
    audio: null,
  }

  private token: string;
  private getAccessToken = this.functions.httpsCallable('getAccessToken');

  constructor(
    private functions: AngularFireFunctions,
  ) { }

  getToken(eventId: string) {
    return this.getAccessToken({ eventId }).toPromise();
  }

  async load<K extends TrackKind>(kind: K, createTrack: () => Promise<Tracks[K]>): Promise<Tracks[K]> {
    if (!this.track[kind]) {
      try {
        this.track[kind] = await createTrack();
      } catch (error) {
        return null;
      }
    }
    return this.track[kind];
  }

  async getTrack(): Promise<Tracks>
  async getTrack<K extends TrackKind>(kind: K): Promise<Tracks[K] | null>
  async getTrack<K extends TrackKind>(kind?: K) {
    if (!kind) {
      const tracks: Tracks = { video: null, audio: null };
      const videoTrackPromise = this.getTrack('video').then(track => tracks['video'] = track);
      const audioTrackPromise = this.getTrack('audio').then(track => tracks['audio'] = track);
      await Promise.all([videoTrackPromise, audioTrackPromise]);
      return tracks;
    } else if (kind === 'video') {
      return this.load('video', createLocalVideoTrack);
    } else if (kind === 'audio') {
      return this.load('audio', createLocalAudioTrack);
    }
  }

  cleanTrack(kind?: TrackKind) {
    if (!kind) {
      this.cleanTrack('video');
      this.cleanTrack('audio');
    } else {
      if (!!this.track[kind]) {
        this.track[kind].stop();
        this.track[kind].removeAllListeners();
        this.track[kind] = null;
      }
    }
  }

  toggleTrack(kind: TrackKind) {
    if (!this.track[kind]) return;

    if (this.track[kind].isEnabled) {
      this.track[kind].disable();
    } else {
      this.track[kind].enable();
    }
  }

}
