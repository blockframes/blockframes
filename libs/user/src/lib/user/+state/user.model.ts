import { UserRole } from "@blockframes/permissions/types";
import { User } from "@blockframes/auth/+state/auth.store";
import { ImgRef, createImgRef } from "@blockframes/utils/image-uploader";

export interface OrganizationMemberRequest {
  email: string;
  roles: string[];
}

export interface OrganizationMember extends OrganizationMemberRequest {
  uid: string;
  firstName?: string;
  lastName?: string;
  avatar?: ImgRef;
  role?: UserRole;
}

/** A factory function that creates an OrganizationMember */
export function createOrganizationMember(user: Partial<User> = {}, role?: UserRole): OrganizationMember {
 return  {
    uid: user.uid,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: createImgRef(user.avatar),
    email: user.email,
    roles: [],
    role,
  };
}
