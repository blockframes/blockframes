export interface OrgDocRights {
  id : string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

export interface SharedDocRights {
  id: string;
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
  admins: string[];
}

export function initializeOwnDocRights(id: string) {
  return {
    id,
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    isAdmin: true,
  } as OrgDocRights;
}

export function initializeSharedDocRights(id: string) {
  return {
    id,
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: [],
    admins: []
  } as SharedDocRights;
}
