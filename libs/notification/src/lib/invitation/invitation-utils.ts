import { Invitation } from "./+state/invitation.model";

/**
 * Creates the message that will be displayed (invitation.message?)
 * @param invitation 
 * @param isForMe 
 */
export function getInvitationMessage(invitation: Invitation, isForMe: boolean) {
  switch (invitation.type) {
    case 'joinOrganization':
      if (invitation.mode === 'request') {
        return `${invitation.fromUser.firstName} ${invitation.fromUser.lastName} wants to join your organization.`;
      } else {
        return `Your organization sent an invitation to this user email: ${invitation.toUser.email}.`;
      }
    case 'attendEvent':
      if (isForMe) {
        if (invitation.mode === 'request') {
          let from;
          if (invitation.fromOrg) {
            from = invitation.fromOrg.denomination.public ? invitation.fromOrg.denomination.public : invitation.fromOrg.denomination.full;
          } else if (invitation.fromUser) {
            from = invitation.fromUser.firstName && invitation.fromUser.lastName ? `${invitation.fromUser.firstName} ${invitation.fromUser.lastName}` : invitation.fromUser.email;
          }
          return `${from} requested to attend your event.`;
        } else {
          return 'You have been invited to an event.';
        }
      } else {
        return `Your ${invitation.mode} has been sent.`;
      }
  }
}

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
