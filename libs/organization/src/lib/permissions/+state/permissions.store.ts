import { StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Permissions } from './permissions.model';
import { CollectionState } from 'akita-ng-fire';


export interface PermissionsState extends CollectionState<Permissions> {}

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

