import { InvitationMode } from "@blockframes/model";
import { where } from "firebase/firestore";

export function buildJoinOrgQuery(orgId: string, mode: InvitationMode) {
  switch (mode) {
    case 'request':
      return [
        where('type', '==', 'joinOrganization'),
        where('mode', '==', 'request'),
        where('toOrg.id', '==', orgId),
        where('status', '==', 'pending')
      ];

    case 'invitation':
    default:
      return [
        where('type', '==', 'joinOrganization'),
        where('mode', '==', 'invitation'),
        where('fromOrg.id', '==', orgId),
        where('status', '==', 'pending')
      ];
  }
}
