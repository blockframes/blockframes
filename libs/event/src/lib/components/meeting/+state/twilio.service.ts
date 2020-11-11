
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { createLocalAudioTrack, createLocalVideoTrack, LocalAudioTrack, LocalVideoTrack } from 'twilio-video';


@Injectable({ providedIn: 'root' })
export class TwilioService {

  public videoTrack: LocalVideoTrack;
  public audioTrack: LocalAudioTrack;

  private token: string;
  private getAccessToken = this.functions.httpsCallable('getAccessToken');

  constructor(
    private functions: AngularFireFunctions,
  ) { }

  getToken(eventId: string) {
    return this.getAccessToken({ eventId }).toPromise();
  }

  async getLocalVideoTrack(): Promise<LocalVideoTrack | null> {
    if (!!this.videoTrack) {
      return this.videoTrack;
    } else {
      try {
        // const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        // if (!!mediaStream) {
          this.videoTrack = await createLocalVideoTrack();
          return this.videoTrack;
        // } else {
        //   return null;
        // }
      } catch(error) {
        return null
      }
    }
  }

  async getLocalAudioTrack(): Promise<LocalAudioTrack | null> {
    if (!!this.audioTrack) {
      return this.audioTrack;
    } else {
      try {
        // const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // (window as any).bfa = mediaStream;
        // if (!!mediaStream) {
          this.audioTrack = await createLocalAudioTrack();
          return this.audioTrack;
        // } else {
        //   return null;
        // }
      } catch(error) {
        return null
      }
    }
  }

  cleanLocalAudio() {
    if (!!this.audioTrack) {
      this.audioTrack.stop();
      this.audioTrack.removeAllListeners();
      this.audioTrack = null;
    }
  }
  cleanLocalVideo() {
    if (!!this.videoTrack) {
      this.videoTrack.stop();
      this.videoTrack.removeAllListeners();
      this.videoTrack = null;
    }
  }

  toggleVideo() {

    if (!this.videoTrack) return;

    if (this.videoTrack.isEnabled) {
      this.videoTrack.disable();
    } else {
      this.videoTrack.enable();
    }
  }

  toggleAudio() {

    if (!this.audioTrack) return;

    if (this.audioTrack.isEnabled) {
      this.audioTrack.disable();
    } else {
      this.audioTrack.enable();
    }
  }

}
