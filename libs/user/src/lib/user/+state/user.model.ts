import { UserRole } from "@blockframes/permissions/types";
import { User, PublicUser, createPublicUser } from "./user.firestore";
export * from './user.firestore';

export interface OrganizationMember extends PublicUser {
  role?: UserRole; // Role of the user in his organization
}

/** A factory function that creates an OrganizationMember */
export function createOrganizationMember(user: Partial<User> = {}, role?: UserRole): OrganizationMember {
  return {
    ...createPublicUser(user),
    role,
  }
}

