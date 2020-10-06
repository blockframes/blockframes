import { Participant } from 'twilio-video';

export interface IParticipantMeeting {
  identity: string,
  isDominantSpeaker: boolean,
  isLocalSpeaker: boolean,
  twilioData: Participant,
  festivalData: {
    firstName: string,
    lastName: string,
    organizationName: string,
    avatar: string
  }
}
