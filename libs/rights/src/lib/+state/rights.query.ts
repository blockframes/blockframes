import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationRights } from './rights.model';
import { RightsState, RightsStore } from './rights.store';

@Injectable({
  providedIn: 'root'
})
export class RightsQuery extends QueryEntity<RightsState, OrganizationRights> {

  constructor(
    protected store: RightsStore,
  ) {
    super(store);
  }

}
