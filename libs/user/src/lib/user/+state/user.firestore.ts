import { HostedMedia, createHostedMedia } from "@blockframes/media/+state/media.firestore";

export interface User {
  uid: string;
  financing: {
    rank: string
  };
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: HostedMedia;
  watermark: HostedMedia;
}


/** A user interface with public information */
export interface PublicUser {
  uid: string;
  email: string;
  avatar?: HostedMedia;
  watermark?: HostedMedia;
  firstName?: string;
  lastName?: string;
  orgId?: string;
}

export function createPublicUser(user: Partial<User> = {}) : PublicUser{
  return {
    uid: user.uid || '',
    email: user.email || '',
    avatar: createHostedMedia(user.avatar),
    watermark: createHostedMedia(user.watermark),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    orgId: user.orgId || ''
  }
}
