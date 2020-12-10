import { LocalAudioTrack, LocalVideoTrack, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';

export type Tracks = LocalTracks | RemoteTracks;
export interface LocalTracks {
  video?: LocalVideoTrack,
  audio?: LocalAudioTrack,
};

export interface RemoteTracks {
  video?: RemoteVideoTrack,
  audio?: RemoteAudioTrack,
};

export type TrackKind = keyof Tracks;

export type AttendeeKind = 'local' | 'remote';
export interface Attendee {
  id: string;
  kind: AttendeeKind,
  tracks: Tracks,
  userName: string,
}

export interface LocalAttendee extends Attendee {
  kind: 'local',
  tracks: LocalTracks,
}

export interface RemoteAttendee extends Attendee {
  kind: 'remote',
  tracks: RemoteTracks,
}
