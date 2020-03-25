import { UserRole } from "@blockframes/permissions/types";
import { User } from "@blockframes/auth/+state/auth.store";
import { ImgRef, createImgRef } from "@blockframes/utils/image-uploader";

export interface OrganizationMemberRequest {
  email: string;
  roles: string[];
}

export interface OrganizationMember extends OrganizationMemberRequest {
  uid: string;
  name?: string;
  surname?: string;
  avatar?: ImgRef;
  role?: UserRole;
}

/** A factory function that creates an OrganizationMember */
export function createOrganizationMember(user: Partial<User> = {}, role?: UserRole): OrganizationMember {
 return  {
    uid: user.uid,
    name: user.name,
    surname: user.surname,
    avatar: createImgRef(user.avatar),
    email: user.email,
    roles: [],
    role,
  };
}
