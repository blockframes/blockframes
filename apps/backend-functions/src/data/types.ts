export { MovieDocument, PublicMovie } from '@blockframes/movie/+state/movie.firestore';
export { ContractDocument, PublicContractDocument, ContractVersionDocument } from '@blockframes/contract/contract/+state/contract.firestore';
export {
  OrganizationDocument,
  PublicOrganization
} from '@blockframes/organization/+state/organization.firestore';
export { OrganizationStatus } from '@blockframes/utils/static-model/types';
export {
  InvitationDocument,
  InvitationOrUndefined,
  InvitationStatus,
  InvitationType,
} from '@blockframes/invitation/+state/invitation.firestore';
export {
  PermissionsDocument,
  DocPermissionsDocument,
  createDocPermissions,
  UserRole
} from '@blockframes/permissions/+state/permissions.firestore';
export { PublicUser } from '@blockframes/user/+state/user.firestore';
export { RequestDemoInformations } from '@blockframes/utils/request-demo';
export { MovieAnalytics, MovieEventAnalytics, StoreConfig } from '@blockframes/movie/+state/movie.firestore';
export { NotificationType, NotificationDocument } from '@blockframes/notification/+state/notification.firestore';
export { EventsAnalytics, EventAnalytics, ScreeningEventDocument } from '@blockframes/event/+state/event.firestore';

/** Custom object used to create an invitation. */
export interface RequestToJoinOrganization {
  adminEmail: string;
  adminName: string;
  organizationName: string;
  organizationId: string;
  userFirstname: string;
  userLastname: string;
}

