import { Invitation } from "./+state/invitation.model";
import { InvitationMode } from "./+state/invitation.firestore";

/**
 * Cleans an invitation of its optional parameters
 * @param invitation 
 */
export function cleanInvitation(invitation: Invitation): Invitation {
  const i = { ...invitation };
  delete i.message; // Remove akita values
  for (const key in i) {
    if (typeof i[key] === 'undefined') delete i[key];
  }
  return i;
}

export function buildJoinOrgQuery(orgId: string, mode: InvitationMode) {
  switch (mode) {
    case 'request':
      return ref => ref
        .where('type', '==', 'joinOrganization')
        .where('mode', '==', 'request')
        .where('toOrg.id', '==', orgId)
        .where('status', '==', 'pending');

    case 'invitation':
    default:
      return ref => ref
        .where('type', '==', 'joinOrganization')
        .where('mode', '==', 'invitation')
        .where('fromOrg.id', '==', orgId)
        .where('status', '==', 'pending');
  }
}
