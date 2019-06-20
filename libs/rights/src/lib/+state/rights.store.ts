import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { OrganizationRights } from './rights.model';

export interface RightsState extends EntityState<OrganizationRights>, ActiveState<string> {}

const initialState = {
  active: null
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'rights', idKey: 'orgId' })
export class RightsStore extends EntityStore<RightsState, OrganizationRights> {
  constructor() {
    super(initialState);
  }

}
