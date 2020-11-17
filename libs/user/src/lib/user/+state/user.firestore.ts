import { DocumentMeta } from "@blockframes/utils/models-meta";

export interface User extends PublicUser {
  financing: {
    rank: string
  };
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: string;
  watermark: string;
  privacyPolicy: {
    date: Date;
    ip: string;
  }
}


/** A user interface with public information */
export interface PublicUser {
  _meta?: DocumentMeta<Date>;
  uid: string;
  email: string;
  avatar?: string;
  watermark?: string;
  firstName?: string;
  lastName?: string;
  orgId?: string;
}

export function createPublicUser(user: Partial<User> = {}) : PublicUser{
  return {
    uid: user.uid ?? '',
    email: user.email ?? '',
    avatar: user.avatar ?? '',
    watermark: user.watermark ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    orgId: user.orgId ?? ''
  }
}
