import { LocalAudioTrack, LocalVideoTrack } from 'twilio-video';


export interface Tracks {
  video: LocalVideoTrack,
  audio: LocalAudioTrack
};

export type TrackKind = keyof Tracks;
