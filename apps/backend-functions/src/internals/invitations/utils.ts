import { InvitationDocument, InvitationOrUndefined } from "../../data/types";

/** Checks if an invitation just got accepted. */
export function wasAccepted(before: InvitationDocument, after: InvitationDocument) {
  return before.status === 'pending' && after.status === 'accepted';
}

/** Checks if an invitation just got declined. */
export function wasDeclined(before: InvitationDocument, after: InvitationDocument) {
  return before.status === 'pending' && after.status === 'declined';
}

/** Checks if an invitation just got created. */
export function wasCreated(before: InvitationOrUndefined, after: InvitationDocument) {
  return !before && !!after;
}