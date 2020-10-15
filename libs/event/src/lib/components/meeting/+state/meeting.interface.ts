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
