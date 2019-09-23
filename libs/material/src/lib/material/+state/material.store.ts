import { EntityState, EntityStore, StoreConfig, MultiActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Material } from './material.model';

export interface MaterialState extends EntityState<Material>, MultiActiveState {}

const initialState = {
  active: [],
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'materials', idKey: 'id' })
export class MaterialStore extends EntityStore<MaterialState, Material> {
  constructor() {
    super(initialState);
  }

  public returnToInitialState() {
    this.update(initialState);
  }
}
