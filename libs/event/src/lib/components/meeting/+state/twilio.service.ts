
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { createLocalAudioTrack, createLocalVideoTrack, LocalAudioTrack, LocalVideoTrack } from 'twilio-video';
import { TrackKind } from './twilio.model';


@Injectable({ providedIn: 'root' })
export class TwilioService {

  localTrack: {
    video: LocalVideoTrack,
    audio: LocalAudioTrack,
  } = {
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

  async getLocalTrack(kind: 'video'): Promise<LocalVideoTrack | null>;
  async getLocalTrack(kind: 'audio'): Promise<LocalAudioTrack | null>;
  async getLocalTrack(kind: TrackKind): Promise<LocalVideoTrack | LocalAudioTrack | null> {
    if (!!this.localTrack[kind]) {
      return this.localTrack[kind];
    } else {
      try {
        if (kind === 'video') {
          this.localTrack[kind] = await createLocalVideoTrack();
        } else if (kind === 'audio') {
          this.localTrack[kind] = await createLocalAudioTrack();
        }
          return this.localTrack[kind];
      } catch(error) {
        return null
      }
    }
  }

  cleanLocalTrack(kind: TrackKind) {
    if (!!this.localTrack[kind]) {
      this.localTrack[kind].stop();
      this.localTrack[kind].removeAllListeners();
      this.localTrack[kind] = null;
    }
  }

  toggleLocalTrack(kind: TrackKind) {
    if (!this.localTrack[kind]) return;

    if (this.localTrack[kind].isEnabled) {
      this.localTrack[kind].disable();
    } else {
      this.localTrack[kind].enable();
    }
  }

}
