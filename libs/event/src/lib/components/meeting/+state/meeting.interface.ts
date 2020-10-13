export interface IParticipantMeeting {
  identity: string,
  isDominantSpeaker: boolean,
  isLocalSpeaker: boolean,
  festivalData: {
    firstName: string,
    lastName: string,
    organizationName: string,
    avatar: string
  }
}
