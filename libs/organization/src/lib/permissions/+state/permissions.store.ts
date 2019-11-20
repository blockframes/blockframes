import { Store, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Permissions } from './permissions.model';


export type PermissionsState = Permissions;

const initialState: PermissionsState = {
  orgId: null,
  superAdmins: [],
  admins: [],
  members: [],
  roles: {},
  canCreate: [],
  canRead: [],
  canUpdate: [],
  canDelete: [],
  userAppPermissions: [],
  userDocPermissions: [],
  organizationDocPermissions: []
}

@Injectable({
  providedIn: 'root'
})
@StoreConfig({name: 'permissions'})
export class PermissionsStore extends Store<PermissionsState> {
  constructor() {
    super(initialState);
  }

}

