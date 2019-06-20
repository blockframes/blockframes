export interface OrganizationRights {
  orgId: string;
  superAdmin: string;
  admins: string [];
  canCreate: string [];
  canRead: string [];
  canUpdate: string [];
  canDelete: string [];
}

export interface AppsRights {
  name: App;
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

export enum App  {
  mediaDelivering = 'MediaDelivering',
  mediaFinanciers = 'MediaFinanciers',
  homeOfScripts = 'HomeOfScripts'
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
    } as AppsRights;
}
