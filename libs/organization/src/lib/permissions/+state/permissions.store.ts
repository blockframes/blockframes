import { StoreConfig, EntityStore, EntityState, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Permissions } from './permissions.model';

export interface PermissionsState extends EntityState<Permissions>, ActiveState<string> {}

const initialState: PermissionsState = {
  active: null
}

@Injectable({
  providedIn: 'root'
})
@StoreConfig({name: 'permissions'})
export class PermissionsStore extends EntityStore<PermissionsState, Permissions> {
  constructor() {
    super(initialState);
  }

}

