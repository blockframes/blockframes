import { PublicOrganization } from "@blockframes/organization/+state/organization.firestore";
import { firestore } from 'firebase/app';
import { PublicUser } from "@blockframes/user/+state/user.firestore";

type Timestamp = firestore.Timestamp;

/** Raw type for Invitation. */
export interface InvitationRaw<D> {
  id: string;
  type: InvitationType;
  mode: InvitationMode,
  status: InvitationStatus;
  date: D;
  /** @dev An invitation is created by an user or an org (fromOrg or fromUser) */
  fromOrg?: PublicOrganization,
  fromUser?: PublicUser,
  /** @dev An invitation is for an user or an org */
  toOrg?: PublicOrganization,
  toUser?: PublicUser,
  /**
   * @dev Can be a titleId or a eventId for example.
   * If empty, the invitation is about Organization and we use directly fromOrg.id
   */
  docId?: string;
  processedId?: string;
  message?: string;
}

/** Specific types of Invitation, both used in firebase functions. */
export type InvitationFromOrganizationToUserDocument = InvitationFromOrganizationToUserRaw<Timestamp>;
export type InvitationFromUserToOrganizationDocument = InvitationFromUserToOrganizationRaw<Timestamp>;
export type InvitationToAnEventDocument = InvitationToAnEventRaw<Timestamp>;
export type InvitationDocument = InvitationFromOrganizationToUserDocument |InvitationFromUserToOrganizationDocument | InvitationToAnEventDocument;
export type InvitationOrUndefined = InvitationDocument | undefined;

/**
 * Specific Invitation/Request to attend an Event.
 * When a invitation is created, a backend function will check if:
 * If we have an user or an org we can create a notification.
 * If we have an email, the function will send an email.
 * If user that received an email invitation and
 * created an account, we will then be able to replace email by the coresponding new user.
 * */
export interface InvitationToAnEventRaw<D> extends InvitationRaw<D> {
  mode: InvitationMode,
  type: 'attendEvent';
  /** @dev EventId */
  docId: string;
}

/**  Specific Invitation send by an Organization to a User to join it. */
export interface InvitationFromOrganizationToUserRaw<D> extends InvitationRaw<D> {
  type: 'joinOrganization';
  mode: 'invitation';
  toUser: PublicUser;
  fromOrg: PublicOrganization;
}

/** Specific Invitation send by a User to join an Organization. */
export interface InvitationFromUserToOrganizationRaw<D> extends InvitationRaw<D> {
  type: 'joinOrganization';
  mode: 'request';
  fromUser: PublicUser;
  toOrg: PublicOrganization;
}

/** Status of an Invitation. Set to pending by default, get erased if accepted, archived if declined. */
export type InvitationStatus = 'accepted' | 'declined' | 'pending';

/** Type of Invitation depending of its purpose. */
export type InvitationType = 'attendEvent' | 'joinOrganization';

export type InvitationMode = 'request' | 'invitation';
