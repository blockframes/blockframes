/**
 * Interface of Participant festival
 */
export interface IParticipantMeeting {
  identity: string,
  isDominantSpeaker: boolean,
  isLocalSpeaker: boolean,
  statusMedia: IStatusVideoMic,
  festivalData: {
    firstName: string,
    lastName: string,
    organizationName: string,
    avatar: string
  }
}


/**
 * Interface for the status of video and audio
 */
export interface IStatusVideoMic {
  video: boolean,
  audio: boolean
}


/**
 * Enum for all Event twilio we can get
 */
export enum meetingEventEnum {
  ParticipantConnected = 'participantConnected',
  ParticipantDisconnected = 'participantDisconnected',
  TrackSubscribed = 'trackSubscribed',
  TrackUnsubscribed = 'trackUnsubscribed',
  Disconnected = 'disconnected',
  TrackDisabled = 'trackDisabled',
  DominantSpeakerChanged = 'dominantSpeakerChanged',
  TrackEnabled = 'trackEnabled',
  TrackStopped = 'trackStopped',
  TrackStarted = 'trackStarted',
}
