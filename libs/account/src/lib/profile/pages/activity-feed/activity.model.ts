import { PublicOrganization } from "@blockframes/organization/+state/organization.firestore";
import { PublicUser } from "@blockframes/auth/+state/auth.firestore";
import { InvitationType, Invitation } from "@blockframes/invitation/types";
import { NotificationType } from "@blockframes/notification/types";
import { Notification } from "@blockframes/notification";

export interface Activity {
  id: string;
  type: InvitationType | NotificationType;
  date: Date;
  docId?: string;
  organization?: PublicOrganization;
  user?: PublicUser;
}

export function createActivity(something: Invitation | Notification): Activity {
  return {
    ...something,
    date: something.date.toDate()
  }
}
