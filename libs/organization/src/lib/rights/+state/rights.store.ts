import { Store, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { OrganizationRights } from './rights.model';


export type RightsState = OrganizationRights;

const initialState: RightsState = {
  orgId: null,
  superAdmins: [],
  admins: [],
  canCreate: [],
  canRead: [],
  canUpdate: [],
  canDelete: [],
  userAppsRights: [],
  userDocsRights: [],
  orgDocsRights: []
}

@Injectable({
  providedIn: 'root'
})
@StoreConfig({name: 'rights'})
export class RightsStore extends Store<RightsState> {
  constructor() {
    super(initialState);
  }

}

