import { UserRole } from "@blockframes/permissions/types";
import { User, PublicUser } from "./user.firestore";
export * from './user.firestore';

export interface OrganizationMember extends PublicUser {
  role?: UserRole; // Role of the user in his organization
}

/** A factory function that creates an OrganizationMember */
export function createOrganizationMember(user: Partial<User> = {}, role?: UserRole): OrganizationMember {
 return  {
    uid: user.uid,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar ?? '',
    watermark: user.watermark ?? '',
    email: user.email,
    role,
  };
}

