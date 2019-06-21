export interface OrganizationRights {
  orgId: string;
  superAdmin: string;
  admins: string [];
  canCreate: string [];
  canRead: string [];
  canUpdate: string [];
  canDelete: string [];
  userAppsRights?: AppRights[];
  userDocsRights?: UserDocRights[];
  orgDocsRights?: OrgDocRights[];
}

export interface AppRights {
  id: string;
  name: App;
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

export interface UserDocRights {
  id: string,
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

export interface OrgDocRights {
  id: string,
  owner: string,
  isAdmin: boolean,
  canCreate: boolean,
  canRead: boolean,
  canUpdate: boolean,
  canDelete: boolean
}

export enum App  {
  mediaDelivering = 'MediaDelivering',
  mediaFinanciers = 'MediaFinanciers',
  storiesAndMore = 'StoriesAndMore'
}

export function initializeOrgRights(params: Partial<OrganizationRights>) {
  return {
    superAdmin: params.superAdmin,
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: [],
    ...params
  } as OrganizationRights;
}

export function initializeAppRights(app: App) {
  return {
      name: app,
      admins: [],
      canCreate: [],
      canRead: [],
      canUpdate: [],
      canDelete: [],
    } as AppRights;
}

export function initializeUserDocRights(docId: string) {
  return {
    id: docId,
    admins: [],
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: []
  } as UserDocRights;
}

export function initializeOrgDocRights(docId: string, orgId:string) {
  return {
    id: docId,
    owner: orgId,
    isAdmin: true,
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true
  } as OrgDocRights;
}
