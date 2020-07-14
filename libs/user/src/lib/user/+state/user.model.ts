import { UserRole } from "@blockframes/permissions/types";
import { User } from "@blockframes/auth/+state/auth.store";
import { ImgRef, createImgRef, HostedMedia, createHostedMedia } from "@blockframes/media/+state/media.firestore";

export * from './user.firestore';

export interface OrganizationMemberRequest {
  email: string;
  roles: string[];
}

export interface OrganizationMember extends OrganizationMemberRequest {
  uid: string;
  firstName?: string;
  lastName?: string;
  avatar?: ImgRef;
  watermark?: HostedMedia;
  role?: UserRole;
}

/** A factory function that creates an OrganizationMember */
export function createOrganizationMember(user: Partial<User> = {}, role?: UserRole): OrganizationMember {
 return  {
    uid: user.uid,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: createImgRef(user.avatar),
    watermark: createHostedMedia(user.watermark),
    email: user.email,
    roles: [],
    role,
  };
}

